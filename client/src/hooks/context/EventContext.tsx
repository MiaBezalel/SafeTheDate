import { PropsWithChildren, createContext, useContext, useState } from 'react'
import { FilterEventParams } from '../../graphql/graphql'

interface EventContextType {
    eventFilters: FilterEventParams | undefined
    setEventFilter: (eventFilters: FilterEventParams) => void
}

export const EventContext = createContext<EventContextType | undefined>(undefined)

export default function EventProvider({ children }: PropsWithChildren) {
    const [eventFilters, setEventFilter] = useState<FilterEventParams | undefined>()

    return (
        <EventContext.Provider value={{ eventFilters, setEventFilter }}>
            {children}
        </EventContext.Provider>
    )
}

export function useEventContext() {
    return useContext(EventContext) as EventContextType
}
