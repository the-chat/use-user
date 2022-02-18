import {useAuthState} from "react-firebase-hooks/auth"
import React, {useEffect} from "react"
import {auth} from "@the-chat/firebase"
import {User} from "firebase/auth"
import {BaseUserData} from "@the-chat/types"
import {useTranslation} from "next-i18next"
import {useDocData} from "@the-chat/db"
import {FirestoreError} from "@firebase/firestore"
import genContext from "@the-chat/gen-context"

type UserStatus = {
  loading: boolean
  error: Error | undefined
}

type UserDataStatus = {
  dbLoading: boolean
  dbError: FirestoreError | null
}

type AllUserData<T extends BaseUserData> = [T, User, UserStatus, UserDataStatus]

// todo?: remove factory that was using for ts
// todo?: default value
// sets default UserData implementation across ENTIRE app (probably)
const getUser = <T extends BaseUserData>(
  useDefaultValueInProviderWrapper,
  defaultValueInContext
) =>
  genContext<AllUserData<T>>(
    ({RealProvider, children}) => {
      const {i18n} = useTranslation()

      const [user, loading, error] = useAuthState(auth)

      // todo??: when user loaded, first dbData can be default, becouse of it only starts watching and getting data at this moment
      // todo?: loading,error. AuthError?
      const [dbData, dbLoading, dbError] = useDocData<T>(
        "users/" + user?.uid,
        useDefaultValueInProviderWrapper()
      )

      useEffect(() => {
        i18n.changeLanguage(dbData.lang)
      }, [dbData.lang])

      return (
        <RealProvider
          value={[dbData, user, {loading, error}, {dbLoading, dbError}]}
        >
          {children}
        </RealProvider>
      )
    },
    [
      defaultValueInContext,
      null,
      {loading: false, error: undefined},
      {
        dbLoading: false,
        dbError: null,
      },
    ]
  )

export default getUser
