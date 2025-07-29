import React from 'react'

const goodnatureTable = () => {
  return (
   <div>
          <table className="table border-0 mb-0 w-full">
            <tbody>
              <tr>
                <td>Booking No.</td>
                <th colSpan="2" className='text-left'>: BK2526001</th>
                <td>Booking Date.</td>
                <th colSpan="2" className='text-left'>: 27 Jul 2025</th>
              </tr>
              <tr>
                <td>Customer Id</td>
                <th colSpan="2" className='text-left'>: GNC-25-26-002</th>
                <td>Application No.</td>
                <th colSpan="2" className='text-left'>: 0630</th>
              </tr>
              <tr>
                <td>Customer Name</td>
                <th colSpan="5" className='text-left'>: SWEETI KUMARI</th>
              </tr>
              <tr>
                <td>W/O</td>
                <th colSpan="5" className='text-left'>: SURENDRA KUMAR</th>
              </tr>
              <tr>
                <td>Mobile No.</td>
                <th colSpan="5" className='text-left'>: 9131506753</th>
              </tr>
              <tr>
                <td>Address</td>
                <th colSpan="5" className='text-left'>
                  : AT- NEW NALANDA COLONY, P.O- BIHAR SHARIF, P.S- LAHERI, CITY- BIHAR SHARIF,
                  Nalanda, Bihar - 803101
                </th>
              </tr>
              <tr>
                <td>Plot Plan</td>
                <th colSpan="5" className='text-left'>: NNNC/ROW/B22</th>
              </tr>
              <tr>
                <td>
                  NW-NE<br />
                  <small>पूर्व पश्चिम जानिब उत्तर</small>
                </td>
                <th className='text-left'>: 40 Ft.</th>
                <td>
                  SW-SE<br />
                  <small>पूर्व पश्चिम जानिब दक्षिण</small>
                </td>
                <th className='text-left'>: 40 Ft.</th>
                <td>
                  NE-SE<br />
                  <small>उत्तर दक्षिण जानिव पूर्व</small>
                </td>
                <th className='text-left'>: 30 Ft.</th>
              </tr>
              <tr>
                <td>
                  NW-SW<br />
                  <small>उत्तर दक्षिण जानिव पश्चिम</small>
                </td>
                <th className='text-left'>: 30 Ft.</th>
                <td>Total Area</td>
                <th className='text-left'>: 1200 Sq.Ft.</th>
              </tr>
              <tr>
                <td>Plot Value</td>
                <th className='text-left'>: 12,00,000.00</th>
                <td>D.P Amount</td>
                <th className='text-left'>: 12,00,000.00</th>
                <td>EMI Amount</td>
                <th className='text-left'>: 0.00</th>
              </tr>
              <tr>
                <td>No. Of. Inst.</td>
                <th className='text-left'>: 1 Month</th>
                <td>Monthly Inst.</td>
                <th className='text-left'>: 0.00</th>
                <td></td>
                <th></th>
              </tr>
            </tbody>
          </table>

          <table className="table table-bordered w-full">
            <thead>
              <tr>
                <th className='text-left'>A/C NO.</th>
                <th className='text-left'>PLOT NO.</th>
                <th className='text-left'>AREA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>56</td>
                <td>358</td>
                <td>
                  1200 <small>Sq.Ft</small>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="table table-bordered w-full mb-0">
            <thead>
              <tr>
                <th className='text-left'>INST. NO.</th>
                <th className='text-left'> INST. DATE</th>
                <th className='text-left'>INST. AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>26-09-2025</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
      </div>
  )
}

export default goodnatureTable
