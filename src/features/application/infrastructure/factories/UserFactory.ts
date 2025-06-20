import { UserAdapter } from '../adapters/UserAdapter';

export const userAdapter = new UserAdapter();
export const getSupervisorSites = userAdapter.getSupervisorSites.bind(userAdapter);
export const getCompanySiteInfo = userAdapter.getCompanySiteInfo.bind(userAdapter); 