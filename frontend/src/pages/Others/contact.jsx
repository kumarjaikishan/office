import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { toast } from "react-toastify";
import { FaPaperPlane } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { MdPerson4 } from "react-icons/md";

const Contact = () => {
  const init = { name: "", email: "", message: "" };
  const [inp, setInp] = useState(init);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInp({ ...inp, [name]: value });
  };

  const register = async (e) => {
    e.preventDefault();

    if (!inp.name || !inp.email || !inp.message) {
      return toast.error("All fields are required");
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_ADDRESS}contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inp),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Message sent successfully!");
        setInp(init);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-20 text-white">

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Contact EMS Support
        </h2>

        <form onSubmit={register} className="space-y-4 flex flex-col gap-4">

          {/* Name */}
          <TextField
            fullWidth
            size="small"
            label="Name"
            name="name"
            value={inp.name}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdPerson4 size={16} color="#94a3b8" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-input": {
                padding: "10px 8px",   // 🔥 compact input padding
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#3b82f6" },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
              "& .MuiInputLabel-root": {
                color: "#94a3b8",
              },
            }}
          />

          {/* Email */}
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            name="email"
            value={inp.email}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoMdMail size={16} color="#94a3b8" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-input": {
                padding: "10px 8px",
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#3b82f6" },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
              "& .MuiInputLabel-root": {
                color: "#94a3b8",
              },
            }}
          />

          {/* Message */}
          <TextField
            fullWidth
            size="small"
            label="Message"
            name="message"
            value={inp.message}
            onChange={handleChange}
            multiline
            rows={3}
            variant="outlined"
            sx={{
              "& .MuiInputBase-input": {
                padding: "10px 8px",   // 🔥 removes extra internal spacing
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#3b82f6" },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
              "& .MuiInputLabel-root": {
                color: "#94a3b8",
              },
            }}
          />

       <Button
  type="submit"
  fullWidth
  disabled={isLoading}
  startIcon={<FaPaperPlane size={14} />}
  sx={{
    height: "42px",
    fontWeight: "600",
    background: "#ffffff",
    color: "#0f172a", // dark text
    textTransform: "none",
    borderRadius: "10px",
    marginTop: "6px",
    boxShadow: "none",
    "&:hover": {
      background: "#e2e8f0",
      boxShadow: "none",
    },
  }}
>
  {isLoading ? "Sending..." : "Send Message"}
</Button>

        </form>
      </div>
    </div>
  );
};

export default Contact;