import BasePolicy from '@modules/base-policy';
import type { JwtClaims } from '@utils/jwt';
import type { projectsTable } from './projects-schema';

// TODO: Add "created_by" to the Project table
export default class ProjectsPolicy extends BasePolicy {
  public index(accountData?: JwtClaims) {
    return this.can('Project.Index', accountData);
  }

  public show(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Project.${project.id}.Show`, accountData) ||
      // this.can('Project.&.Show', accountData, project, 'created_by') ||
      this.can('Project.*.Show', accountData)
    );
  }

  public create(accountData?: JwtClaims) {
    return this.can('Project.Create', accountData);
  }

  public update(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Project.${project.id}.Update`, accountData) ||
      // this.can('Project.&.Update', accountData, project, 'created_by') ||
      this.can('Project.*.Update', accountData)
    );
  }

  public destroy(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Project.${project.id}.Destroy`, accountData) ||
      // this.can('Project.&.Destroy', accountData, project, 'created_by') ||
      this.can('Project.*.Destroy', accountData)
    );
  }
}
