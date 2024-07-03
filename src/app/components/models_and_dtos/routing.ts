export abstract class RoutingTable {
  private static baseUrl = '/api/';
  private static authUrl = '/auth/';

  public static getBaseUrl() {
    return this.baseUrl;
  }

  public static getAuthUrl() {
    return this.authUrl;
  }
}
