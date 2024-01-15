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
    // TODO: After we add "created_by" to the Project table, we can use this:
    return this.canMultiple(
      [`Project.${project.id}.Show`, 'Project.&.Show', 'Project.*.Show'],
      accountData,
      project,
      'created_by'
    );
  }

  public create(accountData?: JwtClaims) {
    return this.can('Project.Create', accountData);
  }

  public update(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Project.${project.id}.Update`, 'Project.&.Update', 'Project.*.Update'],
      accountData,
      project,
      'created_by'
    );
  }

  public destroy(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [
        `Project.${project.id}.Destroy`,
        'Project.&.Destroy',
        'Project.*.Destroy',
      ],
      accountData,
      project,
      'created_by'
    );
  }
}
