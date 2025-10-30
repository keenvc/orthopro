-- Seed initial deployments
INSERT INTO deployments (name, display_name, url, health_check_url, platform, repository_url, branch, status, health_status, environment, notes)
VALUES
  (
    'orthopro',
    'OrthoPro Clinic',
    'https://orthopro.advancedcare.co',
    'https://orthopro.advancedcare.co',
    'render',
    'https://github.com/yourusername/orthopro',
    'main',
    'deployed',
    'unknown',
    'production',
    'Main orthopedic clinic management system'
  ),
  (
    'centered-remits',
    'Centered Remits Dashboard',
    'https://centered.advancedcare.co',
    'https://centered.advancedcare.co',
    'render',
    'https://github.com/yourusername/inbox-health-dashboard',
    'main',
    'deployed',
    'unknown',
    'production',
    'Centered clinic remittance and patient management dashboard'
  ),
  (
    'ih003',
    'IH003 Webhook Server',
    'https://ih003.advancedcare.ai',
    'https://ih003.advancedcare.ai/health',
    'other',
    NULL,
    'main',
    'deployed',
    'unknown',
    'production',
    'Legacy Inbox Health webhook receiver and dashboard'
  )
ON CONFLICT (name) DO NOTHING;
