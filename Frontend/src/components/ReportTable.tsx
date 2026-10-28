import type { CSSProperties } from 'react'
import { MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import type { Report } from '../types'
import { formatDate } from '../utils/format'
import CategoryIcon from './CategoryIcon'
import StatusBadge from './StatusBadge'
import './ReportTable.css'

interface ReportTableProps {
  reports: Report[]
  // Ku çon një rresht, p.sh. "/admin/raportet" → "/admin/raportet/5".
  basePath: string
  // Rreshtat hyjnë njëri pas tjetrit (vetëm herën e parë; shih useEnterOnce).
  enter?: boolean
}

// Lista e kompaktë si tabelë: një rresht i vetëm për raport, kështu në një ekran futen 12-15 raporte (jo 4-5 si te kartat).
// Titulli është lidhje (për tastierën dhe lexuesit e ekranit); kliko kudo te rreshti për të hapur raportin.
function ReportTable({ reports, basePath, enter = false }: ReportTableProps) {
  const navigate = useNavigate()

  return (
    <div className="report-table-wrap">
      <table className={`report-table${enter ? ' report-table--enter' : ''}`}>
        <thead>
          <tr>
            <th scope="col">Statusi</th>
            <th scope="col">Raporti</th>
            <th scope="col" className="hide-sm">
              Kategoria
            </th>
            <th scope="col" className="hide-sm">
              Raportuar nga
            </th>
            <th scope="col" className="report-table-num">
              Mesazhe
            </th>
            <th scope="col" className="report-table-num">
              Data
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr
              key={report.id}
              style={{ '--i': Math.min(index, 10) } as CSSProperties}
              className={`report-row report-row--${report.status}`}
              onClick={(e) => {
                // Kur klikohet vetë lidhja, ajo e hap vetë; mos e hap dy herë.
                if (!(e.target as HTMLElement).closest('a')) navigate(`${basePath}/${report.id}`, { viewTransition: true })
              }}
            >
              <td>
                <StatusBadge status={report.status} />
              </td>
              <td className="report-row-main">
                <Link viewTransition to={`${basePath}/${report.id}`} className="report-row-title">
                  {report.title}
                </Link>
                <span className="report-row-location">{report.location}</span>
              </td>
              <td className="hide-sm">
                <span className="report-row-category">
                  <CategoryIcon name={report.categoryName} size={15} />
                  {report.categoryName}
                </span>
              </td>
              <td className="hide-sm">{report.reporterName}</td>
              <td className="report-table-num">
                <span className="report-row-messages">
                  <MessageSquare size={14} aria-hidden="true" />
                  {report.commentCount}
                </span>
              </td>
              <td className="report-table-num">{formatDate(report.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReportTable
