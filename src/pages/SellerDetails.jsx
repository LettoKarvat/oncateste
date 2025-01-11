import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
} from '@mui/material';
import { Save, CloudUpload, Visibility, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SellerDetails = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [seller, setSeller] = useState(null);
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');
    const [file, setFile] = useState(null);
    const [contracts, setContracts] = useState([]);

    useEffect(() => {
        const fetchSellerDetails = async () => {
            try {
                const detailsResponse = await api.post('/functions/get-seller-details', { sellerId });
                setSeller(detailsResponse.data.result);
                setContact(detailsResponse.data.result.contact || '');
                setAddress(detailsResponse.data.result.address || '');

                const contractsResponse = await api.post('/functions/get-seller-contracts', { sellerId });
                setContracts(contractsResponse.data.result || []);
            } catch (err) {
                console.error('Erro ao carregar detalhes do revendedor:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerDetails();
    }, [sellerId]);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await api.post('/functions/update-seller-details', { sellerId, contact, address });
            alert('Dados atualizados com sucesso!');
        } catch (err) {
            console.error('Erro ao atualizar os dados:', err);
            alert('Erro ao atualizar os dados.');
        } finally {
            setUpdating(false);
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert('Selecione um arquivo para enviar.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64File = reader.result.split(',')[1];
            try {
                await api.post('/functions/upload-seller-contract', {
                    sellerId,
                    title: 'Contrato de Revenda',
                    file: base64File,
                });
                alert('Contrato enviado com sucesso!');
                setFile(null);
                const response = await api.post('/functions/get-seller-contracts', { sellerId });
                setContracts(response.data.result || []);
            } catch (err) {
                console.error('Erro ao enviar o contrato:', err);
                alert('Erro ao enviar o contrato.');
            } finally {
                setUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'linear-gradient(180deg, #e3f2fd, #ffffff)',
            }}
        >
            <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2, textAlign: 'center' }}
            >
                Detalhes do Revendedor
            </Typography>

            <Grid container spacing={2} sx={{ maxWidth: '600px', width: '100%' }}>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: '16px' }}>
                        <TextField
                            label="Nome"
                            fullWidth
                            value={seller?.fullname || 'Sem nome'}
                            disabled
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Contato"
                            fullWidth
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Endereço"
                            fullWidth
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={handleUpdate}
                            disabled={updating}
                            fullWidth
                        >
                            {updating ? <CircularProgress size={20} /> : 'Atualizar Dados'}
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: '16px' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Upload de Contratos
                        </Typography>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ marginBottom: '16px' }}
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<CloudUpload />}
                            onClick={handleFileUpload}
                            disabled={uploading}
                            fullWidth
                        >
                            {uploading ? <CircularProgress size={20} /> : 'Enviar Contrato'}
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: '16px' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Contratos
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {contracts.length === 0 ? (
                            <Typography>Este revendedor não possui contratos.</Typography>
                        ) : (
                            <List>
                                {contracts.map((contract) => (
                                    <ListItem key={contract.id}>
                                        <ListItemText primary={contract.title || 'Sem título'} />
                                        <ListItemSecondaryAction>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Visibility />}
                                                href={contract.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Ver Contrato
                                            </Button>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/users')}
                        fullWidth
                    >
                        Voltar
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SellerDetails;
