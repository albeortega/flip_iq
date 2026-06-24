import { useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { autocompleteAddresses, getAddressDetails } from "../api/addresses";
import type { AddressDetails, AddressSuggestion } from "../types/deals";

type AddressSearchInputProps = {
  value: string;
  onInputChange: (value: string) => void;
  onAddressSelected: (address: AddressDetails) => void;
};

function createSessionToken() {
  return crypto.randomUUID();
}

export default function AddressSearchInput({
  value,
  onInputChange,
  onAddressSelected
}: AddressSearchInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const sessionTokenRef = useRef(createSessionToken());
  const latestRequestRef = useRef(0);

  const selectedValue = useMemo(() => {
    if (!selectedSuggestion || selectedSuggestion.description !== value) {
      return null;
    }

    return selectedSuggestion;
  }, [selectedSuggestion, value]);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < 3 || selectedSuggestion?.description === value) {
      setSuggestions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;
      setIsLoading(true);
      setError(null);

      try {
        const nextSuggestions = await autocompleteAddresses(trimmedValue, sessionTokenRef.current);
        if (latestRequestRef.current === requestId) {
          setSuggestions(nextSuggestions);
        }
      } catch (caughtError) {
        if (latestRequestRef.current === requestId) {
          setSuggestions([]);
          setError(caughtError instanceof Error ? caughtError.message : "Address search failed.");
        }
      } finally {
        if (latestRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [selectedSuggestion?.description, value]);

  async function handleSelection(suggestion: AddressSuggestion | null) {
    setSelectedSuggestion(suggestion);

    if (!suggestion) {
      return;
    }

    onInputChange(suggestion.description);
    setSuggestions([]);
    setIsLoading(true);
    setError(null);

    try {
      const details = await getAddressDetails(suggestion.placeId, sessionTokenRef.current);
      onAddressSelected(details);
      sessionTokenRef.current = createSessionToken();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Address details failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Autocomplete
      className="address-search-input"
      value={selectedValue}
      inputValue={value}
      options={suggestions}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.description}
      isOptionEqualToValue={(option, optionValue) => option.placeId === optionValue.placeId}
      loading={isLoading}
      noOptionsText={value.trim().length < 3 ? "Type at least 3 characters" : "No addresses found"}
      onChange={(_, nextSuggestion) => void handleSelection(nextSuggestion)}
      onInputChange={(_, nextValue, reason) => {
        if (reason === "reset") {
          return;
        }

        setSelectedSuggestion(null);
        onInputChange(nextValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Property address"
          error={Boolean(error)}
          helperText={error ?? " "}
          fullWidth
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }
          }}
        />
      )}
    />
  );
}
