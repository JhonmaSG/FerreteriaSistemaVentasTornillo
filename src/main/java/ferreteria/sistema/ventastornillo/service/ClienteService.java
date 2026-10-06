package ferreteria.sistema.ventastornillo.service;

import ferreteria.sistema.ventastornillo.dto.request.ClienteRequest;
import ferreteria.sistema.ventastornillo.dto.response.ClienteResponse;
import ferreteria.sistema.ventastornillo.exception.BussinessException;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.Cliente;
import ferreteria.sistema.ventastornillo.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteResponse> getClientes(){
        return clienteRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteResponse getClienteId(UUID id){
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente","id", id));
        return mapToResponse(cliente);
    }

    @Transactional
    public ClienteResponse createCliente(ClienteRequest request){
        if(clienteRepository.existsByDni(request.getDni())){
            throw new BussinessException("Ya existe un cliente con el DNI: " + request.getDni());
        }
        if(clienteRepository.existsByEmail(request.getEmail())){
            throw new BussinessException("Ya existe un cliente con el email: " + request.getEmail());
        }

        Cliente clienteAGuardar = Cliente.builder()
                .dni(request.getDni())
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .direccion(request.getDireccion())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .activo(true)
                .build();

        return mapToResponse(clienteRepository.save(clienteAGuardar));
    }

    @Transactional
    public ClienteResponse updateCliente(UUID id, ClienteRequest request){
        Cliente clienteParaActualizar = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente","id", id));

        clienteParaActualizar.setDni(request.getDni());
        clienteParaActualizar.setNombres(request.getNombres());
        clienteParaActualizar.setApellidos(request.getApellidos());
        clienteParaActualizar.setDireccion(request.getDireccion());
        clienteParaActualizar.setTelefono(request.getTelefono());
        clienteParaActualizar.setEmail(request.getEmail());

        return mapToResponse(clienteRepository.save(clienteParaActualizar));
    }

    @Transactional
    public void deleteCliente(UUID id){
        Cliente clienteParaEliminar = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente","id", id));
        clienteRepository.delete(clienteParaEliminar);
    }

    private ClienteResponse mapToResponse(Cliente cliente){
        return ClienteResponse.builder()
                .id(cliente.getId())
                .dni(cliente.getDni())
                .nombres(cliente.getNombres())
                .apellidos(cliente.getApellidos())
                .direccion(cliente.getDireccion())
                .telefono(cliente.getTelefono())
                .email(cliente.getEmail())
                .activo(cliente.getActivo())
                .fechaCreacion(cliente.getFechaCreacion())
                .fechaModificacion(cliente.getFechaModificacion())
                .build();
    }

}
