'@typescript-eslint/no-explicit-any'
import { useSnackbar } from "notistack"
import React from "react"
import Spinner from "./spinner"

interface FetchingStateProps {
  isFetching: boolean
  isError?: any
  isSuccess?: boolean
  children: React.ReactNode
}
const FetchingState: React.FunctionComponent<FetchingStateProps> = ({
  isFetching,
  isError = false,
  children,
}) => {
  const { enqueueSnackbar } = useSnackbar()

  if (isError) {
    console.log(isError)
    enqueueSnackbar("error!", { variant: "error" })
    return <></>
  }

  if (isFetching) {
    return <Spinner />
  }

  return <>{children}</>
}
export default FetchingState
