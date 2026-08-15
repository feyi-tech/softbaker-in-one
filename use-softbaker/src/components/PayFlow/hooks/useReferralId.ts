import { useEffect, useState } from "react";


// Function to get the value of a query parameter from the URL
const getQueryParamValue = (param: any) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(param);
};

const useReferralId = () => {
    
    const [ referralId, setReferralId ] = useState<string | null>()

    const getReferralId = () => localStorage.getItem('referral_id')

    useEffect(() => {
        // Get the referral_id from the URL query
        var refId = getQueryParamValue('ref');

        // Check if referral_id is present in the URL
        if (refId) {
            // Save referral_id to local storage
            localStorage.setItem('referral_id', refId);
            setReferralId(refId)

        } else {
            refId = getReferralId()
            if(refId) {
                setReferralId(refId)
            }
        }
    }, []); // Run the effect only once on mount

    return {
        referralId, getReferralId
    }
}

export default useReferralId