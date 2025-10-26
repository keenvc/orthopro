/**
 * Osmind API Client
 * Handles authentication and all API calls to Centered Osmind Sync API
 */

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  session_token?: string;
  token?: string;
  [key: string]: any;
}

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  [key: string]: any;
}

interface AppointmentData {
  id: string;
  patient_id: string;
  date: string;
  time?: string;
  provider_id?: string;
  room_id?: string;
  status?: string;
  [key: string]: any;
}

interface InsuranceCardData {
  id: string;
  patient_id: string;
  name?: string;
  member_id?: string;
  group_number?: string;
  url?: string;
  [key: string]: any;
}

class OsmindClient {
  private apiUrl: string = 'http://5.161.187.3';
  private sessionToken: string | null = null;
  private loginCredentials: { username: string; password: string } | null = null;

  /**
   * Initialize client with credentials
   */
  setCredentials(username: string, password: string) {
    this.loginCredentials = { username, password };
  }

  /**
   * Login to Osmind API
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 Logging into Osmind API...');

      const response = await fetch(`${this.apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      // Store session token (could be in various fields)
      this.sessionToken = data.session_token || data.token || null;
      this.loginCredentials = { username, password };

      console.log('✅ Successfully logged into Osmind API');
      return data;
    } catch (error) {
      console.error('❌ Osmind login failed:', error);
      throw error;
    }
  }

  /**
   * Ensure we're logged in, login if not
   */
  private async ensureAuthenticated() {
    if (!this.sessionToken && this.loginCredentials) {
      await this.login(this.loginCredentials.username, this.loginCredentials.password);
    }
    if (!this.sessionToken && !this.loginCredentials) {
      throw new Error('Not authenticated and no credentials provided');
    }
  }

  /**
   * Make authenticated request to Osmind API
   */
  private async makeRequest(
    method: string,
    path: string,
    body?: any
  ): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(`${this.apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to re-authenticate
        if (this.loginCredentials) {
          await this.login(this.loginCredentials.username, this.loginCredentials.password);
          return this.makeRequest(method, path, body);
        }
      }
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    return response.json();
  }

  /**
   * Get patient by first name, last name, and optional DOB
   */
  async getPatient(
    firstName: string,
    lastName: string,
    dob?: string
  ): Promise<PatientData[]> {
    await this.ensureAuthenticated();

    let path = `/api/patient?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`;
    if (dob) {
      path += `&dob=${dob}`;
    }

    console.log(`📋 Fetching patient: ${firstName} ${lastName}`);
    return this.makeRequest('GET', path);
  }

  /**
   * Get patient by ID
   */
  async getPatientById(patientId: string): Promise<PatientData> {
    await this.ensureAuthenticated();

    console.log(`📋 Fetching patient by ID: ${patientId}`);
    return this.makeRequest('GET', `/api/patient/${patientId}`);
  }

  /**
   * Get appointments in date range
   */
  async getAppointments(startDate?: string, endDate?: string): Promise<AppointmentData[]> {
    await this.ensureAuthenticated();

    let path = '/api/appointments';
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length > 0) {
      path += '?' + params.join('&');
    }

    console.log(`📅 Fetching appointments from ${startDate || 'today'} to ${endDate || 'one week from today'}`);
    return this.makeRequest('GET', path);
  }

  /**
   * Get appointments for specific patient
   */
  async getAppointmentsByPatientId(patientId: string): Promise<AppointmentData[]> {
    await this.ensureAuthenticated();

    console.log(`📅 Fetching appointments for patient: ${patientId}`);
    return this.makeRequest('GET', `/api/appointments/${patientId}`);
  }

  /**
   * Get appointments for specific provider
   */
  async getAppointmentsByProviderId(providerId: string): Promise<AppointmentData[]> {
    await this.ensureAuthenticated();

    console.log(`📅 Fetching appointments for provider: ${providerId}`);
    return this.makeRequest('GET', `/api/appointments/provider/${providerId}`);
  }

  /**
   * Get appointments for specific clinic room
   */
  async getAppointmentsByRoomId(roomId: string): Promise<AppointmentData[]> {
    await this.ensureAuthenticated();

    console.log(`📅 Fetching appointments for room: ${roomId}`);
    return this.makeRequest('GET', `/api/appointments/clinic/${roomId}`);
  }

  /**
   * Get insurance cards for patient
   */
  async getInsuranceCards(patientId: string): Promise<InsuranceCardData[]> {
    await this.ensureAuthenticated();

    console.log(`🏥 Fetching insurance cards for patient: ${patientId}`);
    return this.makeRequest('GET', `/api/documents/insurance-cards/${patientId}`);
  }

  /**
   * Get uploaded documents for patient
   */
  async getUploadedDocuments(patientId: string): Promise<any[]> {
    await this.ensureAuthenticated();

    console.log(`📎 Fetching uploaded documents for patient: ${patientId}`);
    return this.makeRequest('GET', `/api/documents/uploads/${patientId}`);
  }

  /**
   * Get electronic forms for patient
   */
  async getElectronicForms(patientId: string): Promise<any[]> {
    await this.ensureAuthenticated();

    console.log(`📝 Fetching electronic forms for patient: ${patientId}`);
    return this.makeRequest('GET', `/api/documents/electronic-forms/${patientId}`);
  }

  /**
   * Get invoices for patient
   */
  async getInvoices(patientId: string): Promise<any[]> {
    await this.ensureAuthenticated();

    console.log(`💰 Fetching invoices for patient: ${patientId}`);
    return this.makeRequest('GET', `/api/invoices/${patientId}`);
  }

  /**
   * Get specific invoice
   */
  async getInvoice(patientId: string, invoiceId: string, pdf = false): Promise<any> {
    await this.ensureAuthenticated();

    let path = `/api/invoice/${patientId}/${invoiceId}`;
    if (pdf) {
      path += '?pdf=true';
    }

    console.log(`💰 Fetching invoice: ${invoiceId}`);
    return this.makeRequest('GET', path);
  }
}

// Export singleton instance
export const osmindClient = new OsmindClient();
export type { LoginResponse, PatientData, AppointmentData, InsuranceCardData };
