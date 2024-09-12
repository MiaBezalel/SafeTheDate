import { useQuery } from "urql";
import FetchingState from "../../utils/fetchingState";
import { graphql } from "../../graphql";
import {
  Exact,
  FilterEventParams,
  TicketResponse,
} from "../../graphql/graphql";
import noEventsImage from "../assets/search-no-result.jpg";
import { Grid, Pagination, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { floor } from "lodash";
import { MyTicket } from "./MyTicket";
import { useAuth } from "../../hooks/authController/AuthContext";
import { useSnackbar } from "notistack";
import EmptySearch from "../EmptySearch";

const GridHiddenScroll = styled(Grid)({
  "::-webkit-scrollbar": {
    display: "none",
  },
});

const ticketQuery = graphql(`
  query ticketPageQuery(
    $filterParams: FilterEventParams
    $skip: Int!
    $limit: Int!
  ) {
    ticket(filterParams: $filterParams, skip: $skip, limit: $limit) {
      ticketId
      name
      location
      timeAndDate
      type
      price
      image
      onMarketTime
      barcode
    }
  }
`);

const ticketCountQuery = graphql(`
  query TicketCountQuery($filterParams: FilterEventParams) {
    ticketCount(filterParams: $filterParams)
  }
`);

const EVENTS_PER_FETCH = 12;

interface TicketsProps {
  filterParams?: FilterEventParams;
  userId?: string;
}

const MyTickets = ({ filterParams }: TicketsProps) => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [page, setPage] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [{ data = { ticket: [] }, fetching, error }] = useQuery<
    { ticket: Exact<TicketResponse>[] },
    {
      filterParams: FilterEventParams;
      skip: number;
      limit: number;
      userId: string;
    }
  >({
    query: ticketQuery,
    variables: {
      filterParams: filterParams || {},
      skip: page * EVENTS_PER_FETCH,
      limit: EVENTS_PER_FETCH,
      userId: currentUser?.["_id"] || "",
    },
  });

  const [{ data: dataCount = { ticketCount: 0 } }] = useQuery<
    { ticketCount: number },
    { filterParams: FilterEventParams; userId: string }
  >({
    query: ticketCountQuery,
    variables: {
      filterParams: filterParams || {},
      userId: currentUser?.["_id"] || "",
    },
  });

  function localUpdateMarketTime(ticketId: string) {
    setTickets((prev) => {
      const ticketIndex = prev.findIndex(
        (ticket) => ticket.ticketId === ticketId
      );

      const updatedTickets = [...prev];

      updatedTickets[ticketIndex].onMarketTime = prev[ticketIndex].onMarketTime
        ? 0
        : new Date().getTime();
      return updatedTickets;
    });
  }

  useEffect(() => {
    if (error?.message.includes("Auth failed")) {
      enqueueSnackbar("Token expired, Please login again or refresh", { variant: "error" });
    }
  }, [error])

  useEffect(() => {
    setPage(0);
  }, [filterParams]);

  useEffect(() => {
    if (data?.ticket) setTickets(data.ticket);
  }, [data]);

  if (fetching) {
    return <FetchingState isFetching={fetching} >

    </FetchingState>;
  }

  if (dataCount?.ticketCount === 0) {
    return (
      <EmptySearch message={"No tickets found."} />
    );
  }

  return (
    <FetchingState isFetching={fetching}>
      <GridHiddenScroll container sx={{ height: "inherit", overflowY: "auto" }}>
        {tickets.map((ticket) => {
          const { ticketId, onMarketTime } = ticket;
          return (
            <Grid key={ticketId!} item sm={4} md={3.5}>
              <MyTicket
                ticket={ticket}
                localUpdateMarketTime={localUpdateMarketTime}
                isOnMarket={!!onMarketTime}
              />
            </Grid>
          );
        })}
      </GridHiddenScroll>

      <Pagination
        count={floor(dataCount?.ticketCount / EVENTS_PER_FETCH) + 1}
        page={page + 1}
        variant={"outlined"}
        color={"primary"}
        onChange={(e_, page) => setPage(page - 1)}
        shape="rounded"
      />
    </FetchingState>
  );
};

export default MyTickets;
