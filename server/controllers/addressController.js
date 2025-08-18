import Address from "../models/Address.js"


//Add Address :/api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;        // get address data from client
    const userId = req.userId;            // get userId from auth middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Address.create({ ...address, userId });  // save address with userId
    res.json({ success: true, message: 'Address added successfully' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Get Address : /api/address/get

export const getAddress = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const addresses = await Address.find({ userId });
    res.json({ success: true, addresses });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
