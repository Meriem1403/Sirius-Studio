import { Link } from 'react-router-dom'
import type { ClientProject } from '../../lib/auth/types'
import { Clock } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate } from '../../lib/client/format'

interface ProjectCardProps {
  project: ClientProject
  linkToDetail?: boolean
}

export default function ProjectCard({ project, linkToDetail = true }: ProjectCardProps) {
  const content = (
    <>
      <div className="client-project-top">
        <div>
          <h3 className="client-project-title">{project.title}</h3>
          <p className="client-project-type">{project.type}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="client-progress-wrap">
        <div className="client-progress-bar">
          <span className="client-progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
        <span className="client-progress-label">{project.progress}%</span>
      </div>
      <p className="client-project-next">
        <Clock size={13} strokeWidth={2} className="inline -mt-0.5 mr-1" />
        {project.nextStep}
      </p>
      <p className="client-project-date">Mis à jour le {formatDate(project.updatedAt)}</p>
    </>
  )

  if (linkToDetail) {
    return (
      <Link to={`/espace-client/projets/${project.id}`} className="client-project-card client-project-card--link">
        {content}
      </Link>
    )
  }

  return <article className="client-project-card">{content}</article>
}
