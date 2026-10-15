import { Link, useParams } from 'react-router'

// PËRKOHËSISHT: detajet e raportit ndërtohen në hapin 8.8.
function ReportDetailPage() {
  // useParams lexon vlerën nga adresa: te /raportet/5, id = "5".
  const { id } = useParams()

  return (
    <>
      <p>
        <Link to="/raportet">← Kthehu te raportet e mia</Link>
      </p>
      <h1 className="page-title">Raporti #{id}</h1>
      <p className="page-subtitle">Detajet dhe biseda vijnë në hapat e radhës.</p>
    </>
  )
}

export default ReportDetailPage
