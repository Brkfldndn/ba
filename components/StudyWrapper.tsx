'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import ContentPages from '@/components/ContentPages'
import { saveAnswers } from '../app/actions'

interface Answers {
  [key: string]: string;
}

interface StudyWrapperProps {
  data: any[];
}

const StudyWrapper: React.FC<StudyWrapperProps> = ({ data }) => {
  const [answers, setAnswers] = useState<Answers>({})

  const handleAnswerChange = (index: string, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }))
  }

  const handleSubmit = async () => {
    const result = await saveAnswers(answers)
    if (result.success) {
      alert('Answers saved successfully!')
      // Redirect to success page or handle success scenario
    } else {
      alert('Error saving answers: ' + result.error)
    }
  }

  return (
    <div>
      <Navbar data={data} onSubmit={handleSubmit} />
      <ContentPages data={data} answers={answers} onAnswerChange={handleAnswerChange} />
    </div>
  )
}

export default StudyWrapper