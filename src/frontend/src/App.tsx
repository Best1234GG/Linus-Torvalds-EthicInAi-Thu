import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';

// Android Emulator ใช้ 10.0.2.2, iOS Simulator ใช้ localhost, เครื่องจริงให้ใส่ IP คอมพิวเตอร์
const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/predict',
  ios: 'http://localhost:8000/predict',
  default: 'http://127.0.0.1:8000/predict',
});

interface FormData {
  Age: string;
  DailyRate: string;
  DistanceFromHome: string;
  Education: string;
  EnvironmentSatisfaction: string;
  HourlyRate: string;
  JobInvolvement: string;
  JobLevel: string;
  JobSatisfaction: string;
  MonthlyIncome: string;
  MonthlyRate: string;
  NumCompaniesWorked: string;
  OverTime: string;
  PerformanceRating: string;
  RelationshipSatisfaction: string;
  StockOptionLevel: string;
  TrainingTimesLastYear: string;
  WorkLifeBalance: string;
  YearsAtCompany: string;
  YearsSinceLastPromotion: string;
  YearsWithCurrManager: string;
  PercentSalaryHike: string;
  TotalWorkingYears: string;
  YearsInCurrentRole: string;
}

const initialForm: FormData = {
  Age: '35',
  DailyRate: '800',
  DistanceFromHome: '10',
  Education: '3',
  EnvironmentSatisfaction: '3',
  HourlyRate: '60',
  JobInvolvement: '3',
  JobLevel: '2',
  JobSatisfaction: '3',
  MonthlyIncome: '5000',
  MonthlyRate: '15000',
  NumCompaniesWorked: '2',
  OverTime: 'No',
  PerformanceRating: '3',
  RelationshipSatisfaction: '3',
  StockOptionLevel: '1',
  TrainingTimesLastYear: '2',
  WorkLifeBalance: '3',
  YearsAtCompany: '5',
  YearsSinceLastPromotion: '1',
  YearsWithCurrManager: '3',
  PercentSalaryHike: '14',
  TotalWorkingYears: '10',
  YearsInCurrentRole: '3',
};

export default function App() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  const updateField = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    // แปลงค่าให้ตรงตาม Type ของ Pydantic Model (ตัวเลขเป็น int)
    const payload = {
      Age: parseInt(form.Age, 10) || 0,
      DailyRate: parseInt(form.DailyRate, 10) || 0,
      DistanceFromHome: parseInt(form.DistanceFromHome, 10) || 0,
      Education: parseInt(form.Education, 10) || 0,
      EnvironmentSatisfaction: parseInt(form.EnvironmentSatisfaction, 10) || 0,
      HourlyRate: parseInt(form.HourlyRate, 10) || 0,
      JobInvolvement: parseInt(form.JobInvolvement, 10) || 0,
      JobLevel: parseInt(form.JobLevel, 10) || 0,
      JobSatisfaction: parseInt(form.JobSatisfaction, 10) || 0,
      MonthlyIncome: parseInt(form.MonthlyIncome, 10) || 0,
      MonthlyRate: parseInt(form.MonthlyRate, 10) || 0,
      NumCompaniesWorked: parseInt(form.NumCompaniesWorked, 10) || 0,
      OverTime: form.OverTime,
      PerformanceRating: parseInt(form.PerformanceRating, 10) || 0,
      RelationshipSatisfaction: parseInt(form.RelationshipSatisfaction, 10) || 0,
      StockOptionLevel: parseInt(form.StockOptionLevel, 10) || 0,
      TrainingTimesLastYear: parseInt(form.TrainingTimesLastYear, 10) || 0,
      WorkLifeBalance: parseInt(form.WorkLifeBalance, 10) || 0,
      YearsAtCompany: parseInt(form.YearsAtCompany, 10) || 0,
      YearsSinceLastPromotion: parseInt(form.YearsSinceLastPromotion, 10) || 0,
      YearsWithCurrManager: parseInt(form.YearsWithCurrManager, 10) || 0,
      PercentSalaryHike: parseInt(form.PercentSalaryHike, 10) || 0,
      TotalWorkingYears: parseInt(form.TotalWorkingYears, 10) || 0,
      YearsInCurrentRole: parseInt(form.YearsInCurrentRole, 10) || 0,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถเชื่อมต่อ Server ได้');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, field: keyof FormData) => (
    <View style={styles.inputGroup} key={field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form[field]}
        onChangeText={val => updateField(field, val)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Attrition Prediction</Text>
        <Text style={styles.subHeader}>ป้อนข้อมูลพนักงานเพื่อทำนายแนวโน้ม</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ข้อมูลส่วนบุคคล & สัญญา</Text>
          <View style={styles.row}>
            {renderInput('อายุ (Age)', 'Age')}
            {renderInput('ระยะทางจากบ้าน (km)', 'DistanceFromHome')}
          </View>
          <View style={styles.row}>
            {renderInput('ระดับการศึกษา (1-5)', 'Education')}
            {renderInput('จำนวนบริษัทเดิม', 'NumCompaniesWorked')}
          </View>
          <View style={styles.row}>
            {renderInput('ทำงานรวมกี่ปี', 'TotalWorkingYears')}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ทำล่วงเวลา (OverTime)</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.OverTime === 'Yes' && styles.toggleActive]}
                  onPress={() => updateField('OverTime', 'Yes')}
                >
                  <Text style={[styles.toggleText, form.OverTime === 'Yes' && styles.toggleTextActive]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.OverTime === 'No' && styles.toggleActive]}
                  onPress={() => updateField('OverTime', 'No')}
                >
                  <Text style={[styles.toggleText, form.OverTime === 'No' && styles.toggleTextActive]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>รายได้ & ผลตอบแทน</Text>
          <View style={styles.row}>
            {renderInput('เงินเดือน (MonthlyIncome)', 'MonthlyIncome')}
            {renderInput('DailyRate', 'DailyRate')}
          </View>
          <View style={styles.row}>
            {renderInput('HourlyRate', 'HourlyRate')}
            {renderInput('MonthlyRate', 'MonthlyRate')}
          </View>
          <View style={styles.row}>
            {renderInput('ปรับเงินเดือน (%)', 'PercentSalaryHike')}
            {renderInput('Stock Option (0-3)', 'StockOptionLevel')}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ตำแหน่งงาน & ประสบการณ์</Text>
          <View style={styles.row}>
            {renderInput('Job Level (1-5)', 'JobLevel')}
            {renderInput('อายุงานที่นี่ (ปี)', 'YearsAtCompany')}
          </View>
          <View style={styles.row}>
            {renderInput('ปีในตำแหน่งนี้', 'YearsInCurrentRole')}
            {renderInput('ปีกับ ผจก. ปัจจุบัน', 'YearsWithCurrManager')}
          </View>
          <View style={styles.row}>
            {renderInput('ปีก่อนเลื่อนตำแหน่ง', 'YearsSinceLastPromotion')}
            {renderInput('อบรมปีก่อน (ครั้ง)', 'TrainingTimesLastYear')}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ความพึงพอใจ (ระดับ 1-4)</Text>
          <View style={styles.row}>
            {renderInput('สิ่งแวดล้อมงาน', 'EnvironmentSatisfaction')}
            {renderInput('ความพึงพอใจในงาน', 'JobSatisfaction')}
          </View>
          <View style={styles.row}>
            {renderInput('ความผูกพันในงาน', 'JobInvolvement')}
            {renderInput('ความสัมพันธ์เพื่อนร่วมงาน', 'RelationshipSatisfaction')}
          </View>
          <View style={styles.row}>
            {renderInput('Work Life Balance', 'WorkLifeBalance')}
            {renderInput('Performance (1-4)', 'PerformanceRating')}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handlePredict}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>วิเคราะห์แนวโน้มการลาออก</Text>
          )}
        </TouchableOpacity>

        {prediction !== null && (
          <View style={[styles.resultCard, prediction === 1 ? styles.resultHighRisk : styles.resultLowRisk]}>
            <Text style={styles.resultBadge}>
              {prediction === 1 ? 'เสี่ยงลาออก (Attrition: Yes)' : 'อยู่ต่อ (Attrition: No)'}
            </Text>
            <Text style={styles.resultDetails}>
              {prediction === 1
                ? 'โมเดลคาดการณ์ว่าพนักงานมีแนวโน้มที่จะลาออกจากองค์กร'
                : 'โมเดลคาดการณ์ว่าพนักงานยังมีแนวโน้มอยู่ต่อกับองค์กร'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginTop: 8,
  },
  subHeader: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38bdf8',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
    height: 38,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  toggleText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
  toggleTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultHighRisk: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  resultLowRisk: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  resultBadge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 6,
  },
  resultDetails: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});