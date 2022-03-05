import { useAuthState } from "react-firebase-hooks/auth"
import React, { useEffect } from "react"
import { Auth, User } from "firebase/auth"
import { BaseUserData } from "@the-chat/types"
import { useTranslation } from "next-i18next"
import get from "@the-chat/db"
import { Firestore, FirestoreError } from "@firebase/firestore"
import genContext from "@the-chat/gen-context"

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

// todo?: args to Provider
// todo?: remove factory that was using for ts
// todo?: default value
// sets default UserData implementation across ENTIRE app (probably)
const getUser = <T extends BaseUserData>(
  db: Firestore,
  auth: Auth,
  useDefaultValueForDbDataInProviderWrapper: () => T,
  defaultValueForDbDataInContext: T
) => {
  const { useDocData } = get(db)

  return genContext<AllUserData<T>, { path: string }>(
    ({ RealProvider, path, children }) => {
      const { i18n } = useTranslation()

      const [user, loading, error] = useAuthState(auth)

      // todo??: when user loaded, first dbData can be default, becouse of it only starts watching and getting data at this moment
      // todo?: loading,error. AuthError?
      const [dbData, dbLoading, dbError] = useDocData<T>(
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
    },
    [
      defaultValueForDbDataInContext,
      null,
      { loading: false, error: undefined },
      {
        dbLoading: false,
        dbError: null,
      },
    ]
  )
}

export default getUser