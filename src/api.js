import axios from 'axios';

const API_URL = 'https://stage.apzkyc.com/apzkyc/VerifyKYC';
const SUCCESS_URL = 'https://suhailg21.co.za/KYC/Success.html';
const FAILURE_URL = 'https://suhailg21.co.za/KYC/Failure.html';
const CHECK_VERIFICATION_URL = 'https://stage.apzkyc.com/apzkyc/checkVerification';

// Bearer token retrieval function
const getBearerToken = async () => {
  try {
    const loginResponse = await axios.post('https://stage.apzkyc.com/apzkyc/login', {
      email: process.env.REACT_APP_API_EMAIL,
      password: process.env.REACT_APP_API_PASSWORD,
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.result.token;
      return token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Error fetching bearer token:', error);
    throw error;
  }
};

// Function to upload an image and return the URL
const uploadImage = async (image) => {
  try {
    const token = await getBearerToken();
    const formData = new FormData();
    formData.append('image', image);

    const response = await axios.post('https://stage.apzkyc.com/apzkyc/uploadimage', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data.result;
  } catch (error) {
    console.error('Error uploading image', error);
    throw error;
  }
};

export const checkUserStatus = async (userID) => {
  try {
    const response = await axios.get(`https://stage.apzbsp.com/banking/api/users/APZ-${userID}`, {
      auth: {
        username: process.env.REACT_APP_API_USERNAME,
        password: process.env.REACT_APP_API_PASSWORD1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.status === 'active') {
      return { status: 'user already active' };
    } else if (response.data.status === 'disabled') {
      const customValues = response.data.customValues;
      console.log('Custom Values:', customValues);  // Log to check the data structure

      const livenessid = customValues.find(item => item.field.name === 'Liveness ID')?.stringValue;
      const livenessurl = customValues.find(item => item.field.name === 'Liveness URL')?.stringValue;
      
      console.log('Liveness ID:', livenessid);  // Log Liveness ID
      console.log('Liveness URL:', livenessurl);  // Log Liveness URL

      return { status: 'user disabled', livenessid, livenessurl };
    } else if (response.data.status === 'blocked') {
      const customValues = response.data.customValues;
      console.log('Custom Values:', customValues);  // Log to check the data structure
      const userstatus = customValues.find(item => item.field.name === 'New')?.field.booleanValue;

      console.log('User Status:', userstatus);  
      return { status: 'user blocked', userstatus };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { status: 'user not found' };
    } else {
      console.error('Error checking user status', error);
      throw error;
    }
  }
};


// Function to check user verification status using the new API
const checkUserVerification = async (livenessid) => {
  try {
    console.log('Checking verification for Liveness ID:', livenessid);

    const response = await axios.post(CHECK_VERIFICATION_URL, new URLSearchParams({
      id: livenessid,
    }), {
      headers: {
        'APIKEY': process.env.REACT_APP_API_APIKEY,  // Ensure API key is in an environment variable
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Verification response:', response.data);

    // If the success is true, the user is already verified
    if (response.data.success) {
      return { verified: 'true' };
    } else {
      // Return liveness URL if not verified
      return { verified: false, livenessurl: response.data.result.livenessurl };
    }
  } catch (error) {
    console.error('Error checking user verification', error);
    throw error;
  }
};


// Function to fetch API version
export const getAPIVersion = async (userDetails) => {
  try {
    const response = await axios.get(`https://stage.apzbsp.com/banking/api/users/APZ-${userDetails.ID_Number}/data-for-edit-profile`, {
      auth: {
        username: process.env.REACT_APP_API_USERNAME,
        password: process.env.REACT_APP_API_PASSWORD1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const version = response.data.user.version; // Extracting the version from the response
      console.log('API Version:', version); // Optional: log the version for debugging
      return { version, data: response.data }; // Returning both the version and full data
    } else {
      throw new Error(`Failed to fetch API version: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching API version:', error);
    throw error;
  }
};


// Function to update user status (disabled) after user creation
const updateUserStatus = async (userDetails) => {
  try {
    const response = await axios.post(`https://stage.apzbsp.com/banking/api/APZ-${userDetails.ID_Number}/status`, {
      status: 'disabled',
      comment: 'KYC Pending'
    }, {
      auth: {
        username: process.env.REACT_APP_API_USERNAME,    // Username for Basic Authentication
        password: process.env.REACT_APP_API_PASSWORD1,  // Password for Basic Authentication
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('User status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};


// Function to create user and verify KYC
export const createUserAndVerifyKYC = async (userDetails) => {
  try {
    // Check user status first
    const userStatus = await checkUserStatus(userDetails.ID_Number);
    const { version } = await getAPIVersion(userDetails);

    if (userStatus.status === 'user already active') {
      return { active: 'true' };
    } else if (userStatus.status === 'user disabled') {
      // If user is disabled, check verification status
      const verificationResponse = await checkUserVerification(userStatus.livenessid);
      if (verificationResponse.verified) {
        return { verified: 'true' };
      } else {
        // Return liveness URL from the previous response if not verified
        return { livenessUrl: userStatus.livenessurl };
      }
     } else if (userStatus.status === 'user not found') {
      return { onboarded: 'no'};
    } else if (userStatus.status === 'user blocked') {
      // If user doesn't exist, proceed to create the user and verify KYC
      const addressProofUrl = await uploadImage(userDetails.address_proof);
      const idFrontUrl = await uploadImage(userDetails.ID_Image_front);
      const idBackUrl = await uploadImage(userDetails.ID_Image_Back);

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
        address_proof: addressProofUrl,
        ID_country: userDetails.ID_country,
        ID_type: userDetails.ID_type,
        ID_Number: userDetails.ID_Number,
        ID_Image_front: idFrontUrl,
        ID_Image_Back: idBackUrl,
        SuccessUrl: SUCCESS_URL,
        FailureUrl: FAILURE_URL,
      }), {
        headers: {
          'APIKEY': process.env.REACT_APP_API_APIKEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Extract livenessurl and livenessid from the response
      const livenessurl1 = response.data.url;
      const livenessid1 = response.data.id;

      // Now, use the livenessurl and livenessid to create the user
      const createUserResponse = await axios.put(`https://stage.apzbsp.com/banking/api/users/APZ-${userDetails.ID_Number}`, {
        name: userDetails.firstname + ' ' + userDetails.lastname,
        username: userDetails.ID_Number,  // assuming username is ID number
        email: userDetails.email,
        group: 'members',
        customValues: {
          idnumber: `APZ-${userDetails.ID_Number}`,
          livenessurl: livenessurl1,
          livenessid: livenessid1
        },
        version,
        passwords: [
          {
            type: 'login',
            value: userDetails.password,
            forceChange: false
          }
        ]
        
      }, {
        auth: {
          username: process.env.REACT_APP_API_USERNAME,
          password: process.env.REACT_APP_API_PASSWORD1,
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      await updateUserStatus(userDetails);

      return {
        ...createUserResponse.data,
        livenessurl1,  // spread the existing response data
        KYCYes: 'true',  // add the KYCYes key with value 'true'
        status: userStatus.status, // Include the userStatus.status in the response
      };
    }
  } catch (error) {
    console.error('Error during KYC verification and user creation', error);
    throw error;
  }
};





