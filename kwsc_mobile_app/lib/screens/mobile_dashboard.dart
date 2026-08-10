import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class MobileDashboard extends StatelessWidget {
  const MobileDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('KW&SC', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
            Text('Citizen Portal', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(auth.isAuthenticated ? Icons.notifications : Icons.notifications_none),
            onPressed: () {
              if (!auth.isAuthenticated) {
                Navigator.pushNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 5)),
                ],
              ),
              child: const TextField(
                decoration: InputDecoration(
                  hintText: 'Track Diary No...',
                  prefixIcon: Icon(Icons.search),
                  suffixIcon: Icon(Icons.qr_code_scanner, color: AppTheme.primaryBlue),
                  fillColor: Colors.transparent,
                ),
              ),
            ),
            const SizedBox(height: 32),
            
            // Quick Actions
            Text('QUICK ACTIONS', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildActionItem(context, Icons.insert_drive_file, 'Track File', Colors.blue),
                _buildActionItem(context, Icons.location_on, 'Offices', Colors.green),
                _buildActionItem(context, Icons.water_drop, 'Pay Bill', Colors.cyan),
                _buildActionItem(
                  context, 
                  auth.isAuthenticated ? Icons.dashboard : Icons.verified_user, 
                  auth.isAuthenticated ? 'Dashboard' : 'Verify', 
                  Colors.purple,
                  onTap: () => auth.isAuthenticated ? null : Navigator.pushNamed(context, '/login')
                ),
              ],
            ),
            
            const SizedBox(height: 32),
            Text('RECENT ACTIVITY', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 16),
            
            // Dummy Activity
            _buildActivityItem('NOC Application', 'KWSC-2026-8891', 'In-Process', Colors.green),
            const SizedBox(height: 12),
            _buildActivityItem('Water Connection', 'KWSC-2025-1123', 'Completed', Colors.grey),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: AppTheme.primaryBlue,
        unselectedItemColor: AppTheme.textMuted,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 2) {
            Navigator.pushNamed(context, auth.isAuthenticated ? '/profile' : '/login');
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'Records'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildActionItem(BuildContext context, IconData icon, String label, MaterialColor color, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.shade50,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: color.shade600),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String title, String subtitle, String status, MaterialColor statusColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.blue.shade50, shape: BoxShape.circle),
            child: Icon(Icons.insert_drive_file, color: Colors.blue.shade600),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: statusColor.shade50, borderRadius: BorderRadius.circular(10)),
                  child: Text(status.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: statusColor.shade700)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
