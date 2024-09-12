import { useState } from "react"
import { Stack, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useSnackbar } from "notistack";
import { useMutation, useQuery } from "urql";

import shadowPersonImage from "../../assets/shadow-person.png";
import ImagePicker from "../ImagePicker";
import { graphql } from "../../graphql";
import { Exact, MutationResponse, User } from "../../graphql/graphql";
import { useAuth } from "../../hooks/authController/AuthContext";

const CircleImage = styled("img")({
  width: "200px",
  height: "200px",
  borderRadius: "50%",
  backgroundColor: "#aaa",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const USER_QUERY = graphql(`
  query User($userId: String!) {
    user(userId: $userId) {
      image
      credit
    }
  }
`);

const UPDATE_IMAGE_MUTATION = graphql(`
  mutation updateImage($userId: String!, $image: Upload!) {
    updateImage(userId: $userId, image: $image) {
      message
      code
    }
  }
  `);

export const MyDetails = () => {
  const { currentUser = {} } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [editedImage, setEditedImage] = useState(undefined);
  const [image, setImage] = useState(undefined);

  const [{ data = { user: {} }, fetching, error }] = useQuery<
    { user: Pick<User, "image" | "credit"> },
    { userId: string; }
  >({
    query: USER_QUERY,
    variables: {
      userId: currentUser?.['_id']
    },
  });

  console.log(data.user)

  const [updateUserImageResult, updateUserImage] = useMutation<
    {
      updateImage: MutationResponse;
    }>(UPDATE_IMAGE_MUTATION);

  const onChangeImage = (image) => {
    setEditedImage(image);
  };

  function saveImage() {
    updateUserImage({ image: editedImage, userId: currentUser?.['_id'] }).then((result) => {
      if (result.error) {
        console.error("Error updating ticket:", result.error);
        enqueueSnackbar("An error occurred", { variant: "error" });
      } else {
        enqueueSnackbar(`image saved succesfully`, { variant: "success" });
        console.log("Ticket updated:", result.data?.updateImage);
      }
    });

    setImage(editedImage);
    setEditedImage(undefined);
  }

  return (
    <Stack spacing={3} alignItems="center">
      <CircleImage src={image || data.user?.image || shadowPersonImage} alt="uploaded" />
      <ImagePicker image={editedImage} onChangeImage={onChangeImage} buttonTitle="Edit image" />
      {editedImage && <Button onClick={saveImage} variant="contained" color="primary">Save Image</Button>}
      <Typography variant="h4" color="primary">
        {currentUser?.["firstName"]} {currentUser?.["lastName"]}
      </Typography>
      <Typography variant="h4" color="primary">
        {currentUser?.["username"]}
      </Typography>
      <Typography variant="h4" color="primary">
        {currentUser?.["email"]}
      </Typography>
      <Typography variant="h6" color="primary">
        {`You have ${data.user?.credit} credit in your account`}
      </Typography>
    </Stack>
  );
};

