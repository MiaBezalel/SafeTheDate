import {
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import Events from "../Events";
import { useEffect, useState } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import { FilterEventParams } from "../../graphql/graphql";

enum Filters {
  TODAY,
  THIS_WEEK,
  THIS_MONTH,
}

const getDateFromToday = (days: number) =>
  new Date(new Date().getTime() + 60 * 60 * 24 * 1000 * days);

export const EventsPage = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<Filters>();
  const [filterParams, setFilterParams] = useState<FilterEventParams>({});

  const onFilterSelected = (filter: Filters) => {
    setSelectedFilter(filter);
    let filterValues: FilterEventParams = {};

    switch (filter) {
      case Filters.TODAY: {
        filterValues.from = new Date().getTime();
        filterValues.to = getDateFromToday(1).getTime();
        break;
      }
      case Filters.THIS_WEEK: {
        filterValues.from = new Date().getTime();
        filterValues.to = getDateFromToday(7).getTime();
        break;
      }
      case Filters.THIS_MONTH: {
        filterValues.from = new Date().getTime();
        filterValues.to = getDateFromToday(30).getTime();
        break;
      }
    }

    setFilterParams((prevFilter) => ({
      name: prevFilter.name,
      ...filterValues,
    }));
  };

  useEffect(() => {
    setFilterParams((prevFilter) => ({ ...prevFilter, name: searchText }));
  }, [searchText]);

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      <TextField
        value={searchText}
        placeholder="search"
        color={"secondary"}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Stack spacing={1} direction={"row"} alignItems={"center"}>
        <TuneIcon color={"primary"} />
        <ToggleButtonGroup
          size="small"
          value={selectedFilter}
          exclusive
          onChange={(_, value) => onFilterSelected(value)}
        >
          <ToggleButton value={Filters.TODAY}>
            <Typography>Today</Typography>
          </ToggleButton>
          <ToggleButton value={Filters.THIS_WEEK}>
            <Typography>This Week</Typography>
          </ToggleButton>
          <ToggleButton value={Filters.THIS_MONTH}>
            <Typography>This Month</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Events filterParams={filterParams} />
    </Stack>
  );
};
