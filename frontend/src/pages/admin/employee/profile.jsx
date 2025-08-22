import { FaPhone, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { MdContactEmergency } from 'react-icons/md';
import { BsDroplet } from "react-icons/bs";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PiOfficeChairFill } from "react-icons/pi";
import { FaBuilding } from "react-icons/fa";
import dayjs from 'dayjs';
import { FaCalendarAlt } from "react-icons/fa";
import { BsDropletFill } from "react-icons/bs";
import { LiaMedalSolid } from "react-icons/lia";
import { FaIdCard } from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";
import { GoGear } from "react-icons/go";
import { useSelector } from 'react-redux';

const EmployeeProfile = ({ viewEmployee }) => {
  const [isload, setisload] = useState(false);
  const [employee, setemployee] = useState(null);
  const [submenu, setsubmenu] = useState(1);

  useEffect(() => {
    // console.log(viewEmployee);
    if (!viewEmployee) {
      // console.log(profile)
    }
    const first = async () => {
      const token = localStorage.getItem('emstoken');
      setisload(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_ADDRESS}getemployee?empid=${viewEmployee}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('employee fetch Query:', res.data);
        setemployee(res.data)
      } catch (error) {
        console.log(error);
        if (error.response) {
          toast.warn(error.response.data.message, { autoClose: 1200 });
        } else if (error.request) {
          console.error('No response from server:', error.request);
        } else {
          console.error('Error:', error.message);
        }
      } finally {
        setisload(false);
      }
    }
    first();
  }, [])
  // if (isload) return;

  return <>
    {isload ?
      <div className="w-full h-[300px] flex gap-5 flex-col justify-center items-center bg-white">
        <div className='relative'>
          <GoGear className='animate-spin' style={{ animationDuration: '2.5s' }} size={50} color='teal' />
          <GoGear className='absolute -bottom-4 left-0 animate-spin' style={{ animationDuration: '3s' }} size={20} color='teal' />
        </div>
        <p className='text-teal-600'>loading...</p>
      </div> :
      <div className="max-w-3xl mx-auto bg-white flex flex-col shadow rounded-lg p-2 md:p-4 ">
        <h2 className="text-xl mx-auto font-semibold text-gray-700 mb-4">Employee Details</h2>
        <div className="flex gap-4  pb-2 md:items-start">
          <div className="w-20 h-20 bg-gray-200 rounded-full border-2 border-teal-500 border-dashed p-[2px] flex items-center justify-center overflow-hidden">
            {employee?.profileimage ? (
              <img
                src={employee.profileimage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <FaUser className="text-3xl text-gray-500" />
            )}
          </div>

          <div className="md:flex-1 w-auto">
            <h3 className="text-l md:text-xl capitalize font-bold text-gray-800">{employee?.userid?.name}</h3>
            <p className="text-sm text-gray-600">{employee?.userid?.role}</p>

            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">{employee?.department.department}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">active</span>
            </div>

            <div className="hidden md:flex mt-3 justify-start flex-wrap text-sm text-gray-600 space-y-1">
              <div className="flex w-1/2 items-center gap-2"><FaEnvelope className="text-gray-500 lowercase" /> {employee?.userid?.email}</div>
              <div className="flex w-1/2 items-center gap-2"><FaPhone className="text-gray-500" /> {employee?.phone || 'N/A'}</div>
              <div className="flex w-1/2 items-center gap-2"><FaCalendarAlt className="text-gray-500" /> {dayjs(employee?.userid?.createdAt).format('DD MMM, YYYY')}</div>
              <div className="flex w-1/2 items-center gap-2"><FaIdCard className="text-gray-500" /> ID: emp0002</div>
            </div>
          </div>
        </div>
        
        <div className="md:hidden mt-3 justify-start flex flex-wrap text-[12px] md:text-sm text-gray-600 space-y-1">
          <div className="flex w-1/2 items-center gap-2"><FaEnvelope className="text-gray-500 lowercase" /> {employee?.userid?.email}</div>
          <div className="flex w-1/2 items-center gap-2"><FaPhone className="text-gray-500" /> {employee?.phone || 'N/A'}</div>
          <div className="flex w-1/2 items-center gap-2"><FaCalendarAlt className="text-gray-500" /> {dayjs(employee?.userid?.createdAt).format('DD MMM, YYYY')}</div>
          <div className="flex w-1/2 items-center gap-2"><FaIdCard className="text-gray-500" /> ID: emp0002</div>
        </div>

        <div className="pt-1 capitalize">
          <div className="flex gap-2 md:gap-6 bg-slate-200 p-1 mt-2 text-[12px] md:text-sm font-medium text-gray-700">
            <div onClick={() => setsubmenu(1)} className={`${submenu == 1 ? 'bg-white' : 'text-gray-400'} w-1/3 cursor-pointer py-1.5 text-center rounded`}>Personal Info</div>
            <div onClick={() => setsubmenu(2)} className={`${submenu == 2 ? 'bg-white' : 'text-gray-400'} w-1/3 cursor-pointer py-1.5 text-center rounded`}>Employment</div>
            <div onClick={() => setsubmenu(3)} className={`${submenu == 3 ? 'bg-white' : 'text-gray-400'} w-1/3 cursor-pointer py-1.5 text-center rounded`}>Documents & Skills</div>
          </div>
          {submenu == 1 &&
            <div className="mt-2 grid grid-cols-2 max-h-[300px] overflow-y-auto md:grid-cols-2 gap-4 text-[12px] md:text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <FaBirthdayCake className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Date of Birth</div>
                  <div>{employee?.dob ? dayjs(employee?.dob).format('DD MMM,YYYY') : 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Address</div>
                  <div>{employee?.address || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MdContactEmergency className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Emergency Contact</div>
                  <div>{employee?.Emergencyphone || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BsDropletFill className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Blood Group</div>
                  <div>{employee?.bloodGroup || 'N/A'}</div>
                </div>
              </div>
            </div>}
          {submenu == 2 &&
            <div className="mt-2 grid grid-cols-2 max-h-[300px] overflow-y-auto md:grid-cols-2 gap-4 text-[12px] md:text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <PiOfficeChairFill className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Position</div>
                  <div>{employee?.designation || 'Accounts'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaBuilding className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Department</div>
                  <div>{employee?.department?.department || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MdCurrencyRupee className="mt-1 text-gray-500" />
                <div>
                  <div className="font-semibold">Salary</div>
                  <div>{employee?.salary || 'N/A'}</div>
                </div>
              </div>

            </div>}
          {submenu == 3 &&
            <div className="mt-2 p-2 grid grid-cols-1 max-h-[300px] overflow-y-auto sm:grid-cols-2 gap-4 text-[12px] md:text-sm text-gray-700">
              <div className='rounded border border-gray-300 bg-white p-2 md:p-4 flex flex-col gap-1'>
                <h3 className='font-bold'>Education</h3>
                {employee.education.length > 0 ? employee.education.map((edu) => {
                  return <div className='relative my-1 pl-2 rounded overflow-hidden'>
                    <p className='text-gray-700 font-semibold'>{edu.degree}</p>
                    <p className='text-gray-700'>{edu.institution}</p>
                    <p className='text-gray-500 text-[10px]'>{edu.date}</p>
                    <span className='absolute w-0.5 h-full bg-amber-800 top-0 left-0' ></span>
                  </div>
                }) : <div>No Data found</div>}
              </div>
              <div className='rounded border border-gray-300 bg-white p-2 md:p-4 flex flex-col gap-1'>
                <h3 className='font-bold'>Achievement</h3>
                {employee.achievements.length > 0 ? employee.achievements.map((ach) => {
                  return <div className='relative my-1 pl-5 rounded overflow-hidden'>
                    <p className='text-gray-700 font-semibold'>{ach.title}</p>
                    <p className='text-gray-700'>{ach.description}</p>
                    <p className='text-gray-500 text-[10px]'>{ach.date}</p>
                    <span className='absolute top-1 -left-0' > <LiaMedalSolid size={18} color='orange' /> </span>
                    <span className='absolute w-0.5 h-full bg-blue-500 top-0 right-0' ></span>
                  </div>
                }) : <div>No Achievement found</div>}

              </div>
            </div>}
        </div>
      </div>}
  </>;
};

export default EmployeeProfile;
