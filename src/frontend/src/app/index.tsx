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
  Platform,
} from 'react-native';

const API_URL = Platform.select({
  web: 'http://localhost:8000/predict',
  android: 'http://10.0.2.2:8000/predict',
  ios: 'http://localhost:8000/predict',
  default: 'http://localhost:8000/predict',
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
  Age: '32',
  DailyRate: '850',
  DistanceFromHome: '8',
  Education: '3',
  EnvironmentSatisfaction: '3',
  HourlyRate: '62',
  JobInvolvement: '3',
  JobLevel: '2',
  JobSatisfaction: '3',
  MonthlyIncome: '5400',
  MonthlyRate: '14200',
  NumCompaniesWorked: '2',
  OverTime: 'No',
  PerformanceRating: '3',
  RelationshipSatisfaction: '3',
  StockOptionLevel: '1',
  TrainingTimesLastYear: '3',
  WorkLifeBalance: '3',
  YearsAtCompany: '5',
  YearsSinceLastPromotion: '1',
  YearsWithCurrManager: '3',
  PercentSalaryHike: '14',
  TotalWorkingYears: '9',
  YearsInCurrentRole: '3',
};

export default function HomeScreen() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  const updateField = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

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

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err: any) {
      const msg = err.message || 'Cannot connect to server';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Connection Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, field: keyof FormData, unit?: string) => (
    <View style={styles.inputItem} key={field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form[field]}
          onChangeText={val => updateField(field, val)}
          placeholderTextColor="#64748b"
        />
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>
    </View>
  );

  const renderRatingGroup = (label: string, field: keyof FormData, max: number = 4) => (
    <View style={styles.ratingItem} key={field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillGroup}>
        {Array.from({ length: max }, (_, i) => String(i + 1)).map(score => {
          const isSelected = form[field] === score;
          return (
            <TouchableOpacity
              key={score}
              style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
              onPress={() => updateField(field, score)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{score}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.centerContainer}>
      <View style={styles.shell}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>HR Retention Intelligence</Text>
          </View>
          <Text style={styles.title}>Employee Attrition Risk Predictor</Text>
          <Text style={styles.subtitle}>
            ประเมินความเสี่ยงการลาออกของบุคลากรด้วยแบบจำลอง Deep Learning (LSTM)
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>1. ข้อมูลพื้นฐาน & สัญญาจ้าง</Text>
          <View style={styles.grid}>
            {renderInput('อายุ', 'Age', 'ปี')}
            {renderInput('ระยะทางจากที่พัก', 'DistanceFromHome', 'km')}
            {renderInput('การศึกษาสูงสุด (1-5)', 'Education', 'ระดับ')}
            {renderInput('จำนวนบริษัทเดิม', 'NumCompaniesWorked', 'แห่ง')}
            {renderInput('ประสบการณ์รวม', 'TotalWorkingYears', 'ปี')}
            
            <View style={styles.inputItem}>
              <Text style={styles.label}>ทำงานล่วงเวลา (OverTime)</Text>
              <View style={styles.switchGroup}>
                {['No', 'Yes'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.switchBtn, form.OverTime === opt && styles.switchBtnActive]}
                    onPress={() => updateField('OverTime', opt)}
                  >
                    <Text style={[styles.switchText, form.OverTime === opt && styles.switchTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>2. รายได้และค่าตอบแทน</Text>
          <View style={styles.grid}>
            {renderInput('เงินเดือนประจำ (Monthly)', 'MonthlyIncome', 'USD')}
            {renderInput('อัตราค่าจ้างรายวัน', 'DailyRate', 'USD')}
            {renderInput('อัตราค่าจ้างรายชั่วโมง', 'HourlyRate', 'USD')}
            {renderInput('Monthly Rate', 'MonthlyRate', 'USD')}
            {renderInput('การปรับขึ้นเงินเดือน', 'PercentSalaryHike', '%')}
            {renderInput('ระดับหุ้นพนักงาน (0-3)', 'StockOptionLevel', 'Level')}
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>3. ตำแหน่งและอายุงาน</Text>
          <View style={styles.grid}>
            {renderInput('ระดับงาน (Job Level 1-5)', 'JobLevel', 'Level')}
            {renderInput('อายุงานในบริษัท', 'YearsAtCompany', 'ปี')}
            {renderInput('ระยะเวลาในตำแหน่งปัจจุบัน', 'YearsInCurrentRole', 'ปี')}
            {renderInput('ระยะเวลากับ ผจก. คนนี้', 'YearsWithCurrManager', 'ปี')}
            {renderInput('ปีก่อนได้เลื่อนตำแหน่ง', 'YearsSinceLastPromotion', 'ปี')}
            {renderInput('การอบรมในปีที่ผ่านมา', 'TrainingTimesLastYear', 'ครั้ง')}
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>4. ดัชนีความพึงพอใจ & ประสิทธิภาพ (Rating 1 - 4)</Text>
          <View style={styles.grid}>
            {renderRatingGroup('สภาพแวดล้อมการทำงาน', 'EnvironmentSatisfaction')}
            {renderRatingGroup('ความพึงพอใจในงาน', 'JobSatisfaction')}
            {renderRatingGroup('ความผูกพันต่อองค์กร', 'JobInvolvement')}
            {renderRatingGroup('ความสัมพันธ์กับเพื่อนร่วมงาน', 'RelationshipSatisfaction')}
            {renderRatingGroup('Work-Life Balance', 'WorkLifeBalance')}
            {renderRatingGroup('ผลการประเมินงาน (Rating)', 'PerformanceRating')}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handlePredict}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnPrimaryText}>วิเคราะห์ความเสี่ยงพนักงาน</Text>
          )}
        </TouchableOpacity>

        {/* Result UI */}
        {prediction !== null && (
          <View
            style={[
              styles.resultBanner,
              prediction === 1 ? styles.bannerDanger : styles.bannerSafe,
            ]}
          >
            <View style={styles.resultIconBox}>
              <Text style={styles.resultIcon}>{prediction === 1 ? '⚠️' : '🛡️'}</Text>
            </View>
            <View style={styles.resultTextBox}>
              <Text style={styles.resultTitle}>
                {prediction === 1 ? 'High Attrition Risk (เสี่ยงลาออก)' : 'Retention Stable (มีแนวโน้มอยู่ต่อ)'}
              </Text>
              <Text style={styles.resultDesc}>
                {prediction === 1
                  ? 'แบบจำลองตรวจพบสัญญาณเสี่ยงที่พนักงานอาจลาออก แนะนำให้ HR นัดหมาย 1-on-1 หรือทบทวน Work-Life Balance และค่าตอบแทน'
                  : 'ตัวชี้วัดความผูกพันและค่าตอบแทนอยู่ในเกณฑ์ปลอดภัย ยังไม่มีสัญญาณบ่งชี้การเปลี่ยนงานในระยะสั้น'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  centerContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  shell: {
    width: '100%',
    maxWidth: 780,
  },
  header: {
    marginBottom: 28,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  tagText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f293d',
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  inputItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0f19',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#26334d',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#f8fafc',
    fontSize: 14,
    outlineStyle: 'none' as any,
  },
  unitText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  ratingItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  pillBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#0b0f19',
    borderWidth: 1,
    borderColor: '#26334d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  switchGroup: {
    flexDirection: 'row',
    height: 40,
    gap: 6,
  },
  switchBtn: {
    flex: 1,
    backgroundColor: '#0b0f19',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#26334d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  switchTextActive: {
    color: '#ffffff',
  },
  btnPrimary: {
    backgroundColor: '#4f46e5',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  resultBanner: {
    flexDirection: 'row',
    marginTop: 24,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    alignItems: 'flex-start',
  },
  bannerDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  bannerSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 20,
  },
  resultTextBox: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
});