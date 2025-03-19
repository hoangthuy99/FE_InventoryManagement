import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { SearchIcon } from "../icons";

function FilterBox({
  searchKey,
  handleSearch,
  options,
  optionSelected,
  handleChangeOption,
  handleChangeSearchKey
}) {
  return (
    <Box className="" display={"flex"} alignItems={"center"} gap={5}>
      <Box display={"flex"} alignItems={"center"} gap={1}>
        <TextField
          value={searchKey}
          onChange={(e) => handleChangeSearchKey(e.target.value)}
          size="small"
          placeholder="Nhập từ khóa..."
        />
        <Button
          onClick={handleSearch}
          size="large"
          type="button"
          variant="contained"
          color="primary"
        >
          <SearchIcon width={20} height={20} fontSize={14} />
        </Button>
      </Box>

      <Box display={"flex"} alignItems={"center"} gap={1}>
        <FormControl fullWidth>
          <InputLabel id="selectLabel">Trạng thái</InputLabel>
          <Select
            labelId="selectLabel"
            value={optionSelected}
            label="Trạng thái"
            onChange={(e) => handleChangeOption(e.target.value)}
            size="small"
          >
            <MenuItem value={-1}>Tất cả</MenuItem>
            {options?.map((opt) => {
              return <MenuItem value={opt?.id}>{opt?.title}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default FilterBox;
