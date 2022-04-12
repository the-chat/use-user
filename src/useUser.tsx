import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect } from "react"
import { Auth, User } from "firebase/auth"
import { useTranslation } from "next-i18next"
import getDb from "@the-chat/db"
import { FirestoreError } from "@firebase/firestore"
import genContext from "@the-chat/gen-context"

// todo?: lang: "en" | "ru"
export type BaseUserData = Pick<
  User,
  "uid" | "displayName" | "email" | "photoURL" | "phoneNumber"
> & {
  lang: string
}

type UserStatus = {
  loading: boolean
  error: Error | undefined
}

type UserDataStatus = {
  dbLoading: boolean
  dbError: FirestoreError | undefined
}

export type AllUserData<T extends BaseUserData> = [
  T,
  User,
  UserStatus,
  UserDataStatus
]

type DefaultAllUserData = AllUserData<BaseUserData>

export type Props = {
  path: string
  auth: Auth
  useUserData: ReturnType<typeof getDb>["useDocData"]
  useDefaultValueForDbDataInProviderWrapper: () => BaseUserData
}

export const [useUser, UserProvider] = genContext<DefaultAllUserData, Props>(
  ({
    auth,
    path,
    children,
    useUserData,
    RealProvider,
    useDefaultValueForDbDataInProviderWrapper,
  }) => {
    const { i18n } = useTranslation()
    const [user, loading, error] = useAuthState(auth)
    const [dbData, dbLoading, dbError] = useUserData<BaseUserData>(
      path + user?.uid,
      useDefaultValueForDbDataInProviderWrapper()
    )

    useEffect(() => {
      i18n.changeLanguage(dbData.lang)
    }, [dbData.lang])

    return (
      <RealProvider
        value={[dbData, user, { loading, error }, { dbLoading, dbError }]}
      >
        {children}
      </RealProvider>
    )
  }
)
