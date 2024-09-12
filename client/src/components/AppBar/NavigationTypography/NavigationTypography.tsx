import {Grid, styled, Typography, TypographyProps} from "@mui/material"
import { RoutePaths } from "../../../App"
import * as React from "react"
import { useLocation, useNavigate, useNavigation } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { useCallback } from "react"

interface NavigationTypographyProps extends TypographyProps {
  route: RoutePaths
}

const StyledTypography = styled(Typography)(({theme}) => ({
  transition: "0.3s",
  "color:hover": theme.palette.secondary.main
}))

const NavigationTypography = ({
  route,
  children,
  ...other
}: NavigationTypographyProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const getColor = useCallback(() => {
    return location?.pathname == route
      ? theme.palette.secondary.main
      : theme.palette.primary.main
  }, [location])

  return (
    <StyledTypography
      {...other}
      color={getColor()}
      onClick={() => navigate(route)}
      sx={{cursor: "pointer", typography: {sm: 'h6', md: "h5"}}}
    >
      {children}
    </StyledTypography>
  )
}

export default NavigationTypography
