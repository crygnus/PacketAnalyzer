package in.ac.bits.protocolanalyzer.persistence.entity;

import javax.persistence.Id;

import org.springframework.data.elasticsearch.annotations.Document;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(indexName = "credentials", type = "login")
public class LoginInfoEntity {

    @Id
    private String id;

    private String email;

    private String password;

    private String loginHash;
}
