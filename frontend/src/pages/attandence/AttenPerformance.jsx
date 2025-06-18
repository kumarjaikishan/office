import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AttenPerformance = () => {
    const { employeeId } = useParams();
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!employeeId) return;
        console.log(employeeId)
        const fetchPerformanceData = async () => {
            const token = localStorage.getItem('emstoken')
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}employeeAttandence`,
                    {
                        params: { employeeId }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(res.data)
                setPerformanceData(res.data.attandence);
            } catch (err) {
                console.error('Failed to fetch performance data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [employeeId]);

    return (
        <div className="p-4">
            {loading && <p>Loading performance data...</p>}
            {/* {error && <p className="text-red-500">Error: {error.message}</p>} */}
            {performanceData && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Performance for Employee: {employeeId}</h2>
                    {/* Replace with real data structure */}
                    <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(performanceData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default AttenPerformance;
