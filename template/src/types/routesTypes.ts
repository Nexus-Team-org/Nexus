export type routesTypes = {
  path: string;
  component: any;
  isProtected: boolean;
  allowedRoles?: string[];
};
