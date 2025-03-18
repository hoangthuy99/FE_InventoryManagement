import { Height } from "@mui/icons-material";
import {
  Box,
  Button,
  Input,
  InputLabel,
  Modal,
  Typography,
} from "@mui/material";
import { useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  Height: 300,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: "5px",
  p: 4,
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

function ImportExcel({ action, sampleFile }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      <Button variant="contained" color="success" onClick={handleOpen}>
        Import Excel
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form
            onSubmit={async (e) => {
              const isFinish = await action(e);
              if (isFinish) {
                setOpen(false);
              }
            }}
          >
            <Box marginBottom={3}>
              <InputLabel color="secondary" itemID="file">
                File Input
              </InputLabel>
              <Input required id="file" name="file" type="file" />
            </Box>

            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Button variant="contained" color="primary" type="button">
                <a download={sampleFile?.fileName} href={sampleFile?.base64}>Download file sample</a>
              </Button>
              <Button type="submit" variant="contained" color="secondary">
                Submit
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}

export default ImportExcel;
