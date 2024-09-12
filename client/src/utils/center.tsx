import styled from "@emotion/styled"

interface ICenterProps {
  direction?: string
  justifyContent?: string
  alignItems?: string
  height?: string
  width?: string
  children: React.ReactNode
}

const CenterStyle = styled.div((props: ICenterProps) => ({
  display: "flex",
  alignItems: props.alignItems ?? "center",
  justifyContent: props.justifyContent ?? "center",
  height: props.height ?? "auto",
  width: props.width ?? "auto",
  flexDirection: props.direction === "column" ? "column" : "row",
}))

export const Center: React.FC<ICenterProps> = ({
  direction = "column",
  justifyContent = "center",
  alignItems = "center",
  height = "auto",
  width = "auto",
  children,
}) => {
  return (
    <CenterStyle
      direction={direction}
      justifyContent={justifyContent}
      alignItems={alignItems}
      height={height}
      width={width}
    >
      {children}
    </CenterStyle>
  )
}
