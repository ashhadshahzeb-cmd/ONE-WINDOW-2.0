import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  
  User? _user;
  String? _userRole;
  String? _userName;

  User? get user => _user;
  String? get userRole => _userRole;
  String? get userName => _userName;

  bool get isAuthenticated => _user != null || _userRole != null;

  AuthService() {
    _init();
  }

  Future<void> _init() async {
    // Check for local HRMS fallback session
    final prefs = await SharedPreferences.getInstance();
    final hrmsId = prefs.getString('kwsb_hrms_emp_id');
    
    if (hrmsId != null) {
      _userRole = 'hrms_employee';
      _userName = prefs.getString('kwsb_hrms_name') ?? 'HRMS Employee';
      notifyListeners();
      return;
    }

    // Normal Supabase session
    _supabase.auth.onAuthStateChange.listen((data) {
      _user = data.session?.user;
      if (_user != null) {
        _fetchUserProfile(_user!);
      } else {
        _userRole = null;
        _userName = null;
        notifyListeners();
      }
    });
  }

  Future<void> _fetchUserProfile(User user) async {
    try {
      final response = await _supabase
          .from('department_users_settings')
          .select('*')
          .eq('email', user.email!)
          .maybeSingle();

      if (response != null) {
        _userRole = response['role_id'];
        _userName = response['display_name'];
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching profile: $e');
    }
  }

  Future<Map<String, dynamic>> signIn(String email, String password) async {
    final trimEmail = email.trim().toLowerCase();
    
    try {
      await _supabase.auth.signInWithPassword(
        email: trimEmail,
        password: password,
      );
      return {'success': true};
    } catch (e) {
      // HRMS Fallback logic
      try {
        final hrmsResponse = await _supabase
            .from('hrms_employees')
            .select('*')
            .eq('email', trimEmail)
            .maybeSingle();

        if (hrmsResponse != null && hrmsResponse['password'] == password) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('kwsb_hrms_emp_id', hrmsResponse['id'].toString());
          await prefs.setString('kwsb_hrms_name', hrmsResponse['name'].toString());
          
          _userRole = 'hrms_employee';
          _userName = hrmsResponse['name'].toString();
          notifyListeners();
          
          return {'success': true};
        }
      } catch (fallbackError) {
        debugPrint('HRMS Fallback failed: $fallbackError');
      }

      return {'success': false, 'error': e.toString()};
    }
  }

  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('kwsb_hrms_emp_id');
    await prefs.remove('kwsb_hrms_name');
    
    _userRole = null;
    _userName = null;
    
    await _supabase.auth.signOut();
    notifyListeners();
  }
}
