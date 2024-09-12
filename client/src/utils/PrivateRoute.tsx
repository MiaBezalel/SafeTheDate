import { Navigate, useLocation } from "react-router-dom";
import Spinner from "./spinner";

const PrivateRoute = ({ children }: { children: JSX.Element }): any => {
  // const { currentUser } = useAuth()
  const location = useLocation()
  return (
    <>
      {true ? (
        false ? (
          <Navigate to="/login" state={{ from: location }} />
        ) : (
          { ...children }
        )
      ) : (
        <Spinner />
      )}
    </>
  )
}
export default PrivateRoute
