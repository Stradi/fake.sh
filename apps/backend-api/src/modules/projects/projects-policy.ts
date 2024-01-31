import BasePolicy from '@modules/base-policy';
import type { JwtClaims } from '@utils/jwt';
import type { projectsTable } from './projects-schema';

export default class ProjectsPolicy extends BasePolicy {
  public index(accountData?: JwtClaims) {
    return this.can('Project.Index', accountData);
  }

  public show(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
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

  public getUsage(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [
        `Project.${project.id}.GetUsage`,
        'Project.&.GetUsage',
        'Project.*.GetUsage',
      ],
      accountData,
      project,
      'created_by'
    );
  }

  public deleteAllVersions(
    project: typeof projectsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [
        `Project.${project.id}.DeleteAllVersions`,
        'Project.&.DeleteAllVersions',
        'Project.*.DeleteAllVersions',
      ],
      accountData,
      project,
      'created_by'
    );
  }
}
