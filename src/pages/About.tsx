import React from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
} from '@mui/material'
import { Link } from '@tanstack/react-router'

const About: React.FC = () => {
  const technologies = [
    { name: 'Vite', description: 'Rychlý build tool a dev server' },
    { name: 'React', description: 'UI knihovna pro tvorbu komponent' },
    { name: 'TypeScript', description: 'Typovaný JavaScript' },
    { name: 'TanStack React Query', description: 'Server state management' },
    { name: 'TanStack React Router', description: 'Type-safe routing' },
    { name: 'Zustand', description: 'Lightweight state management' },
    { name: 'Material-UI', description: 'React UI component library' },
    { name: 'Emotion', description: 'CSS-in-JS library' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          O aplikaci
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Tato React aplikace demonstruje moderní frontend stack s nejnovějšími
          technologiemi pro efektivní vývoj webových aplikací.
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" component="h2" gutterBottom>
            Použité technologie
          </Typography>
          <Stack spacing={2}>
            {technologies.map((tech) => (
              <Box key={tech.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label={tech.name} color="primary" />
                <Typography variant="body2">
                  {tech.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Funkcionality
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Rychlý vývoj:</strong> Vite poskytuje téměř okamžitý hot reload
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Type Safety:</strong> TypeScript zajišťuje typovou bezpečnost
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>State Management:</strong> Zustand pro klientský stav, React Query pro server stav
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Modern Routing:</strong> TanStack Router s type-safe navigací
        </Typography>
        <Typography variant="body1" paragraph>
          • <strong>Komponenty:</strong> Material-UI pro konzistentní design
        </Typography>
      </Box>

      <Button component={Link} to="/" variant="contained">
        Zpět na domovskou stránku
      </Button>
    </Container>
  )
}

export default About