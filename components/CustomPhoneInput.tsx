'use client';

import React from 'react';
import PhoneInput, { Country } from 'react-phone-number-input';
import Select, { components, SingleValue, OptionProps, SingleValueProps } from 'react-select';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';
import 'react-phone-number-input/style.css';

interface CountryOption {
  value: Country;
  label: string;
  code: string;
}

import Image from 'next/image';

const CountryFlag = ({ country }: { country: Country }) => (
  <Image
    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
    alt={country}
    width={20}
    height={14}
    unoptimized
    className="rounded-sm object-cover"
  />
);

const CustomOption = (props: OptionProps<CountryOption>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-3 py-1">
      <CountryFlag country={props.data.value} />
      <span className="flex-1 text-sm">{props.data.label}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{props.data.code}</span>
    </div>
  </components.Option>
);

const CustomSingleValue = (props: SingleValueProps<CountryOption>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <CountryFlag country={props.data.value} />
      <span className="text-sm font-medium">{props.data.code}</span>
    </div>
  </components.SingleValue>
);

interface CustomPhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  error?: boolean;
  placeholder?: string;
}

export default function CustomPhoneInput({
  value,
  onChange,
  className = '',
  error = false,
  placeholder = 'Enter phone number'
}: CustomPhoneInputProps) {
  const [country, setCountry] = React.useState<Country>('GB');
  
  const countries = getCountries();
  const countryOptions: CountryOption[] = countries.map((c) => ({
    value: c,
    label: en[c],
    code: `+${getCountryCallingCode(c)}`
  }));

  const selectedOption = countryOptions.find(opt => opt.value === country);

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: '48px',
      borderColor: error ? 'rgb(239 68 68)' : state.isFocused ? 'rgb(147 51 234)' : 'rgb(209 213 219)',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 'none',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(147, 51, 234, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'rgb(147 51 234)' : 'rgb(156 163 175)',
      },
      backgroundColor: 'white',
      cursor: 'pointer'
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: '300px',
      padding: '0.25rem'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'rgb(240 253 250)'
        : state.isFocused
        ? 'rgb(243 244 246)'
        : 'white',
      color: state.isSelected ? 'rgb(6 78 59)' : 'rgb(31 41 55)',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      padding: '0.5rem 0.75rem',
      '&:active': {
        backgroundColor: 'rgb(240 253 250)'
      }
    }),
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'rgb(156 163 175)'
    }),
    singleValue: (base: any) => ({
      ...base,
      margin: 0
    })
  };

  const darkModeStyles = {
    control: (base: any, state: any) => ({
      ...customStyles.control(base, state),
      backgroundColor: 'rgb(55 65 81)',
      borderColor: error ? 'rgb(239 68 68)' : state.isFocused ? 'rgb(147 51 234)' : 'rgb(75 85 99)',
      '&:hover': {
        borderColor: state.isFocused ? 'rgb(147 51 234)' : 'rgb(107 114 128)',
      }
    }),
    menu: (base: any) => ({
      ...customStyles.menu(base),
      backgroundColor: 'rgb(55 65 81)'
    }),
    option: (base: any, state: any) => ({
      ...customStyles.option(base, state),
      backgroundColor: state.isSelected
        ? 'rgb(5 150 105)'
        : state.isFocused
        ? 'rgb(75 85 99)'
        : 'rgb(55 65 81)',
      color: state.isSelected ? 'white' : 'rgb(229 231 235)'
    }),
    input: (base: any) => ({
      ...customStyles.input(base),
      color: 'rgb(229 231 235)'
    }),
    singleValue: (base: any) => ({
      ...customStyles.singleValue(base),
      color: 'rgb(229 231 235)'
    })
  };

  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className={`flex items-stretch ${className}`}>
      <Select<CountryOption>
        options={countryOptions}
        value={selectedOption}
        onChange={(option: SingleValue<CountryOption>) => {
          if (option) {
            setCountry(option.value);
          }
        }}
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          IndicatorSeparator: () => null
        }}
        styles={isDarkMode ? darkModeStyles : customStyles}
        isSearchable
        placeholder="Search country..."
        className="w-32 flex-shrink-0"
        classNamePrefix="react-select"
      />
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 px-4 py-3 rounded-r-lg border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-blue-500 dark:focus:border-red-500 transition-all border-l-0`}
      />
    </div>
  );
}
