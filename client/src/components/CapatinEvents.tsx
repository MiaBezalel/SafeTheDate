import { useEventContext } from "../hooks/context/EventContext"
import Events from "./Events"

const CaptainEvents = () => {
    const {eventFilters} = useEventContext()

    return <Events filterParams={eventFilters}/>
}

export default CaptainEvents