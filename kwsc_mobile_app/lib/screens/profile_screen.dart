import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundSlate,
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.only(top: 60, left: 20, right: 20, bottom: 30),
            decoration: const BoxDecoration(
              color: AppTheme.primaryBlue,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const Text('My Profile', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 48), // spacer
                  ],
                ),
                const SizedBox(height: 20),
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.blue.shade300, width: 4),
                  ),
                  child: const Center(child: Icon(Icons.person, size: 50, color: Colors.grey)),
                ),
                const SizedBox(height: 16),
                Text(auth.userName ?? 'Citizen', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                Text(auth.userRole?.toUpperCase() ?? 'USER', style: TextStyle(color: Colors.blue.shade100, fontSize: 12, fontWeight: FontWeight.bold)),
                Text(auth.user?.email ?? '', style: TextStyle(color: Colors.blue.shade50, fontSize: 14)),
              ],
            ),
          ),

          // Menu Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade100),
                  ),
                  child: Column(
                    children: [
                      _buildMenuItem(Icons.security, 'Security & Privacy'),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(Icons.credit_card, 'Payment Methods'),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(Icons.notifications_none, 'Notifications'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () async {
                    await auth.signOut();
                    if (context.mounted) Navigator.pushReplacementNamed(context, '/login');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade50,
                    foregroundColor: Colors.red.shade600,
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.logout),
                  label: const Text('Sign Out'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppTheme.backgroundSlate,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: Colors.grey.shade600),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: () {},
    );
  }
}
