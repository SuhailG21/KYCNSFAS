import axios from 'axios';

const API_URL = 'https://stage.apzkyc.com/apzkyc/VerifyKYC';
const USER_DETAILS_URL = 'https://stage.apzbsp.com/banking/api/users/';
const API_KEY = 'APZ9babea218d5f3504353fedb8f942daef20045326855a9a28c14570ca68b862b497e0a35c39c0599971ea612048aac41a';
const SUCCESS_URL = 'http://localhost:3000/Success.html';
const FAILURE_URL = 'http://localhost:3000/Failure.html';

export const fetchUserDetails = async (idNumber) => {
  try {
    const response = await axios.get(`${USER_DETAILS_URL}APZ-${idNumber}`, {
      auth: {
        username: 'suhail',
        password: 'Test@1234',
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Error fetching user details:', error);
    return null; // Allow proceeding in case of an error
  }
};

export const createUserAndVerifyKYC = async (userDetails) => {
  try {
    const response = await axios.post(API_URL, new URLSearchParams({
      Firstname: userDetails.firstname,
      Lastname: userDetails.lastname,
      dob: userDetails.dob,
      email: userDetails.email,
      phone: userDetails.phone,
      address_line1: userDetails.address_line1,
      address_line2: userDetails.address_line2,
      city: userDetails.city,
      stateOrProvince: userDetails.stateOrProvince,
      postalcode: userDetails.postalcode,
      Country: userDetails.country,
      address_proof: userDetails.address_proof,
      ID_country: userDetails.ID_country,
      ID_type: userDetails.ID_type,
      ID_Number: userDetails.ID_Number,
      ID_Image_front: userDetails.ID_Image_front,
      ID_Image_Back: userDetails.ID_Image_Back,
      SuccessUrl: SUCCESS_URL,
      FailureUrl: FAILURE_URL,
    }), {
      headers: {
        'APIKEY': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error during KYC verification", error);
    throw error;
  }
};


