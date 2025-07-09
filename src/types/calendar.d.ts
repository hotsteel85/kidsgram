declare module 'react-native-calendars' {
  export interface DateData {
    year: number;
    month: number;
    day: number;
    timestamp: number;
    dateString: string;
  }

  export interface CalendarProps {
    onDayPress?: (day: DateData) => void;
    markedDates?: {
      [date: string]: {
        marked?: boolean;
        dotColor?: string;
        selected?: boolean;
        selectedColor?: string;
        textColor?: string;
        disabled?: boolean;
        disableTouchEvent?: boolean;
      };
    };
    theme?: {
      backgroundColor?: string;
      calendarBackground?: string;
      textSectionTitleColor?: string;
      selectedDayBackgroundColor?: string;
      selectedDayTextColor?: string;
      todayTextColor?: string;
      dayTextColor?: string;
      textDisabledColor?: string;
      dotColor?: string;
      selectedDotColor?: string;
      arrowColor?: string;
      monthTextColor?: string;
      indicatorColor?: string;
      textDayFontWeight?: string;
      textMonthFontWeight?: string;
      textDayHeaderFontWeight?: string;
      textDayFontSize?: number;
      textMonthFontSize?: number;
      textDayHeaderFontSize?: number;
    };
    style?: any;
  }

  export class Calendar extends React.Component<CalendarProps> {}
} 