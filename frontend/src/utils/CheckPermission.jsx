import { useEffect } from 'react'
import { useSelector } from 'react-redux';

const CheckPermission = (resource, action) => {
    const { profile } = useSelector(e => e.user);
    useEffect(() => {
        // console.log(profile)
    }, [])

    if (profile.role == 'superadmin') return true;
    const haveType = profile?.permissions[resource];
    if (!haveType) return false;

    return profile.permissions[resource].includes(action);
}

export default CheckPermission
