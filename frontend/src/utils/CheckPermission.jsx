import { useEffect } from 'react'
import { useSelector } from 'react-redux';

const CheckPermission = (resource, action) => {
    const { profile } = useSelector(e => e.user);
    useEffect(() => {
       
    }, [])

    if (profile.role == 'superadmin') return true;
    // console.log(resource,action)
    const haveType = profile?.permissions[resource];
    if (!haveType) return false;

    return profile.permissions[resource].includes(action);
}

export default CheckPermission
