import Swal from "sweetalert2";
import { User } from "use-softbaker/dist/components/Firebase/data.type";
import { FIREBASE_FUNCTION_API_BASE_URL } from "../../app-config";


const syncUserBalance = async (user?: User | null) => {
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Authentication required",
        text: "You're not signed in",
      });
      return;
    }
  
    // Prompt the user to enter their email
    const { value: email } = await Swal.fire({
      title: "Enter the user email",
      input: "email",
      inputLabel: "Email address",
      inputPlaceholder: "Enter the user email address",
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage("Please enter the user email address");
        }
        return email;
      },
    });
  
    // If the user cancels or doesn't enter an email, exit the function
    if (!email) return;
  
    // Show a loading modal
    Swal.fire({
      title: "Syncing balance...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    try {
      // Get the auth token
      const authToken = await user.getIdToken();
  
      // Send the POST request
      const response = await fetch(`${FIREBASE_FUNCTION_API_BASE_URL}/update_balance`, {
        method: "POST",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coins: ["bnb"], recipientEmail: email }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to sync user balance");
      }
  
      const data = await response.json();
      // Close the loading modal before showing success
      Swal.close();
  
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message || "User balance synced successfully!",
      });
    } catch (error: any) {
      // Close the loading modal if an error occurs
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred while syncing user balance",
      });
      //console.log("syncUserBalance.error", error?.message);
    }
};
  

export default syncUserBalance