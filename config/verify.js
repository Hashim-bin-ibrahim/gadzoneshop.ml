require('dotenv').config

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_SERVICE_ID;

module.exports ={
    doSms:(noData)=>{
        let res = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verifications.create({
                to : `+91${noData.phonenumber}`,
                channel:"sms"
            }).then((res)=>{
                res.valid =false
                resolve(res)
                console.log(res);
            })
        })
    },
    otpVerify:(otpData,nuData)=>{
        let resp = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${nuData.phonenumber}`,
                code: otpData.otp
            }).then((resp)=>{   
                console.log('verification failed');
                console.log(resp);
                resolve(resp)
            })
        })
    },
    adminLogin:()=>{
        let res = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verifications.create({
                to : `+91${9633802594}`,
                channel:"sms"
            }).then((res)=>{
                res.valid =false
                resolve(res)
                console.log(res);
            })
        })
    },
    otpAdminVerify:(otpData)=>{
        let resp = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${9633802594}`,
                code: otpData.otp
            }).then((resp)=>{
                console.log('verification failed');
                console.log(resp);
                resolve(resp)
            })
        })
    }
}