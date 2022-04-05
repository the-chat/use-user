import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect } from "react"
import { Auth, User } from "firebase/auth"
import { useTranslation } from "next-i18next"
import get from "@the-chat/db"
import { Firestore, FirestoreError } from "@firebase/firestore"
import genContext from "@the-chat/gen-context"

// todo?:
// lang: "en" | "ru"
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
  dbError: FirestoreError | null
}

export type AllUserData<T extends BaseUserData> = [
  T,
  User,
  UserStatus,
  UserDataStatus
]

// todo?: default value

type DefaultAllUserData = AllUserData<BaseUserData>

export type Props = {
  path: string
  db: Firestore
  auth: Auth
  useDefaultValueForDbDataInProviderWrapper: () => BaseUserData
}

export const [useUser, UserProvider] = genContext<DefaultAllUserData, Props>(
  ({
    db,
    auth,
    path,
    children,
    RealProvider,
    useDefaultValueForDbDataInProviderWrapper,
  }) => {
    const { useDocData } = get(db)

    const { i18n } = useTranslation()

    const [user, loading, error] = useAuthState(auth)

    // todo??: when user loaded, first dbData can be default, becouse of it only starts watching and getting data at this moment
    // todo?: loading,error. AuthError?
    const [dbData, dbLoading, dbError] = useDocData<BaseUserData>(
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
