import useLogs from "@the-chat/use-logs"
import { Auth, signOut } from "firebase/auth"
import { SnackbarMessage } from "notistack"
import { useState } from "react"

const useSignOut = (
  auth: Auth,
  successMessage: SnackbarMessage,
  errorMessage: string
) => {
  const [waiting, setWaiting] = useState()
  const { handleSuccess, handleError } = useLogs(setWaiting)

  return {
    waiting,
    signOut: () =>
      signOut(auth)
        .then(handleSuccess(successMessage))
        .catch(handleError(errorMessage)),
  }
}

export default useSignOut
