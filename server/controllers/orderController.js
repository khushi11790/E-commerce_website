import Order from "../models/Order";


//Place Order COD :/api/order/cod
export const placeOrderCOD=async(req,res)=>{
    try {
        const {userId,items,address} =req.body;
        if(!address||items.length===0){
            return res.json({success:false,message:"Invalid data"})
        }
        //Calculate Amount Using Items
        let amount = await Items.reduce(async(acc,items)=>{
            const product = await Product.findId(items.product);
            return (await aa) + product.offerPrice*items.quantity;
        },0)

        //Add Tax Charge(2%)
        amount +=Math.floor(amount*0.02);
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"COD",
        });
        return res.json({success:true,message:"Order Placed Successfully"})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

//Get Oders by ID : /api/order/user
export const getUserOrder =async (req,res)=>{
    try {
        const {userId} = req.body;
        const orders = await Order.find({
            userId,
            $or: [{paymentType:"COD"},{isPaid:true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({success:true,orders});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//get All orders (for seller/admin) : /api/order/seller

export const getUserOrder =async (req,res)=>{
    try {
        
        const orders = await Order.find({
            userId,
            $or: [{paymentType:"COD"},{isPaid:true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({success:true,orders});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}