import { useAuth } from "../../hooks/authController/AuthContext";
import Events from "../Events"

export const MyEvents = () => {
  const { currentUser } = useAuth();

  return <Events userId={currentUser?.["_id"]}/>
}
