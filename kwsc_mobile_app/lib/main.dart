import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';

import 'theme/app_theme.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/mobile_dashboard.dart';
import 'screens/profile_screen.dart';

// Replace with actual Supabase keys from your .env
const supabaseUrl = 'https://lhnogjmeyqbuoiruykpw.supabase.co';
const supabaseAnonKey = 'sb_publishable_t4svZ8krxb9VqkPA0epoDQ_s-av_vnE';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  runApp(const KWSCApp());
}

class KWSCApp extends StatelessWidget {
  const KWSCApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: MaterialApp(
        title: 'KW&SC One Window',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/',
        routes: {
          '/': (context) => const MobileDashboard(),
          '/login': (context) => const LoginScreen(),
          '/profile': (context) => const ProfileScreen(),
        },
      ),
    );
  }
}
